// Universal cross-platform build wrapper for Cloudflare Pages, Netlify, and CI/CD
process.env.CI = 'false';
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.GENERATE_SOURCEMAP = 'false';
require('react-scripts/scripts/build');
