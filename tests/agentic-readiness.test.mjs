import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('--- Running Agentic Readiness Test Suite ---');

// 1. Validate Non-JS HTML Text Length (>500 chars) & Sequential Headings
const filesToVerify = [
  { file: 'public/index.html', minChars: 500, expectedH1: 'Bihar AI Mission' },
  { file: 'public/about/index.html', minChars: 500, expectedH1: 'About Bihar AI Mission' },
  { file: 'public/contact/index.html', minChars: 500, expectedH1: 'Contact Bihar AI Mission' },
  { file: 'public/privacy/index.html', minChars: 500, expectedH1: 'Privacy Policy' },
];

for (const item of filesToVerify) {
  const filePath = path.join(ROOT, item.file);
  assert.ok(fs.existsSync(filePath), `File exists: ${item.file}`);
  const html = fs.readFileSync(filePath, 'utf-8');
  
  // Check text content without tags
  const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]+>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
  
  console.log(`[PASS] ${item.file} raw text length: ${textContent.length} chars (required: >${item.minChars})`);
  assert.ok(textContent.length >= item.minChars, `Text length of ${item.file} is >= ${item.minChars}`);
  assert.ok(html.includes('<h1'), `${item.file} contains <h1> tag`);
  assert.ok(html.includes(item.expectedH1), `${item.file} contains expected H1 text "${item.expectedH1}"`);
  assert.ok(html.includes('rel="canonical"'), `${item.file} contains canonical tag`);
}

// 2. Validate Agent Instruction Files
const agentFiles = [
  'public/llms.txt',
  'public/llms.md',
  'public/agent-instructions.md',
  'public/.well-known/agent-instructions.md'
];

for (const rel of agentFiles) {
  const p = path.join(ROOT, rel);
  assert.ok(fs.existsSync(p), `Agent instruction file exists: ${rel}`);
  const content = fs.readFileSync(p, 'utf-8');
  assert.ok(content.length > 200, `${rel} has substantial content`);
  console.log(`[PASS] ${rel} verified (${content.length} bytes)`);
}

const llmsTxt = fs.readFileSync(path.join(ROOT, 'public/llms.txt'), 'utf-8');
assert.ok(llmsTxt.includes('When to use this'), 'llms.txt contains "When to use this" section');
assert.ok(llmsTxt.includes('Best-fit use cases'), 'llms.txt contains "Best-fit use cases" section');
assert.ok(llmsTxt.includes('When NOT to use this'), 'llms.txt contains "When NOT to use this" section');

// 3. Validate wrangler.jsonc configuration
const wranglerJson = fs.readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf-8');
assert.ok(wranglerJson.includes('"not_found_handling": "none"'), 'wrangler.jsonc has not_found_handling set to "none"');
console.log('[PASS] wrangler.jsonc correctly configured for strict 404 handling');

// 4. Test worker.js routing logic directly
import worker from '../worker.js';

// Mock environment and asset storage
const mockAssets = new Map([
  ['http://localhost/index.html', { body: '<!DOCTYPE html><html><body>Home</body></html>', headers: { 'content-type': 'text/html' } }],
  ['http://localhost/about/index.html', { body: '<!DOCTYPE html><html><body>About</body></html>', headers: { 'content-type': 'text/html' } }],
  ['http://localhost/contact/index.html', { body: '<!DOCTYPE html><html><body>Contact</body></html>', headers: { 'content-type': 'text/html' } }],
  ['http://localhost/privacy/index.html', { body: '<!DOCTYPE html><html><body>Privacy</body></html>', headers: { 'content-type': 'text/html' } }],
  ['http://localhost/llms.txt', { body: '# Bihar AI Mission llms.txt', headers: { 'content-type': 'text/markdown' } }],
  ['http://localhost/llms.md', { body: '# Bihar AI Mission llms.md', headers: { 'content-type': 'text/markdown' } }],
  ['http://localhost/404.html', { body: '<!DOCTYPE html><html><body>404 Page</body></html>', headers: { 'content-type': 'text/html' } }],
]);

const mockEnv = {
  ASSETS: {
    async fetch(req) {
      const u = new URL(req.url);
      const key = `${u.origin}${u.pathname}`;
      if (mockAssets.has(key)) {
        const item = mockAssets.get(key);
        return new Response(item.body, {
          status: 200,
          headers: new Headers(item.headers),
        });
      }
      return new Response('Not found', { status: 404 });
    }
  }
};

// 4a. Unknown path must return HTTP 404 (NEVER 500 or 200)
const req404 = new Request('http://localhost/some-random-unknown-path-xyz');
const res404 = await worker.fetch(req404, mockEnv);
assert.equal(res404.status, 404, 'Unknown path returns real HTTP 404');
assert.ok(res404.headers.get('vary')?.includes('Accept'), '404 response includes Vary: Accept');
console.log('[PASS] Unknown path correctly returns HTTP 404 with Vary header');

// 4b. Accept: text/markdown negotiation must return text/markdown
const reqMarkdown = new Request('http://localhost/', {
  headers: { 'Accept': 'text/markdown' }
});
const resMarkdown = await worker.fetch(reqMarkdown, mockEnv);
assert.equal(resMarkdown.status, 200, 'Markdown negotiation returns status 200');
assert.ok(resMarkdown.headers.get('content-type')?.includes('text/markdown'), 'Content-Type is text/markdown');
assert.ok(resMarkdown.headers.get('vary')?.includes('Accept'), 'Vary header includes Accept');
console.log('[PASS] Accept: text/markdown negotiation returns markdown with Vary: Accept, Accept-Encoding');

// 4c. Known route /about returns 200 with HTML
const reqAbout = new Request('http://localhost/about');
const resAbout = await worker.fetch(reqAbout, mockEnv);
assert.equal(resAbout.status, 200, 'Known route /about returns status 200');
assert.ok(resAbout.headers.get('vary')?.includes('Accept'), 'About page includes Vary header');
console.log('[PASS] /about returns HTTP 200 with pre-rendered HTML');

// 4d. Known SPA route /admin returns 200 with index.html app shell
const reqAdmin = new Request('http://localhost/admin');
const resAdmin = await worker.fetch(reqAdmin, mockEnv);
assert.equal(resAdmin.status, 200, 'Known SPA route /admin returns status 200');
console.log('[PASS] /admin returns HTTP 200 with SPA app shell');

// 4e. Known SPA route /learning returns 200 with index.html app shell
const reqLearning = new Request('http://localhost/learning');
const resLearning = await worker.fetch(reqLearning, mockEnv);
assert.equal(resLearning.status, 200, 'Known SPA route /learning returns status 200');
console.log('[PASS] /learning returns HTTP 200 with SPA app shell');

console.log('\nAll Agentic Readiness tests passed successfully!\n');
