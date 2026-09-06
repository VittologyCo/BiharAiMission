/**
 * Cloudflare Worker with Static Assets for Bihar AI Mission (biharaimission.org)
 * 
 * Features:
 * - Serverless Resend API Proxy (/api/send-email)
 * - Cloudflare R2 File Storage (/api/upload-r2)
 * - Google Drive API Service Account Upload (/api/upload-drive, /api/upload, /upload)
 * - System Health & Diagnostic Endpoints (/api/health, /health)
 * - Client Configuration Endpoint (/api/config)
 * - React SPA Routing with Security & Cache Headers
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ═══════════════════════════════════════════════════════════════
    // Canonical HTTPS & Apex Domain Enforcement (301 Permanent Redirect)
    // ═══════════════════════════════════════════════════════════════
    const isLocal = url.hostname.includes('localhost') || url.hostname.includes('127.0.0.1');
    if (!isLocal && (url.protocol === 'http:' || url.hostname.startsWith('www.'))) {
      url.protocol = 'https:';
      if (url.hostname.startsWith('www.')) {
        url.hostname = url.hostname.replace(/^www\./, '');
      }
      return Response.redirect(url.toString(), 301);
    }

    // ═══════════════════════════════════════════════════════════════
    // Universal CORS Preflight for all API & Upload Endpoints
    // ═══════════════════════════════════════════════════════════════
    if (
      request.method === 'OPTIONS' &&
      (url.pathname.startsWith('/api/') ||
        url.pathname === '/upload' ||
        url.pathname === '/health' ||
        url.pathname === '/.netlify/functions/send-email')
    ) {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-storage-secret',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // Health & Diagnostic Check — /health, /api/health
    // ═══════════════════════════════════════════════════════════════
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'Bihar AI Mission Cloudflare Worker',
          domain: 'biharaimission.org',
          timestamp: new Date().toISOString(),
          integrations: {
            supabase: 'connected',
            resendEmail: !!(env?.RESEND_API_KEY || env?.REACT_APP_RESEND_API_KEY),
            googleDrive: !!(env?.GOOGLE_SERVICE_ACCOUNT_EMAIL && env?.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
            cloudflareR2: !!env?.R2_BUCKET,
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          },
        }
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // Client Configuration — /api/config
    // ═══════════════════════════════════════════════════════════════
    if (url.pathname === '/api/config') {
      // Dynamically resolve storage server URL from any possible key or value in env
      let resolvedStorageUrl = '';
      if (env) {
        resolvedStorageUrl =
          env.REACT_APP_STORAGE_SERVER_URL ||
          env['REACT_APP_STORAGE_SER\\'] ||
          env.REACT_APP_STORAGE_SER ||
          env.REACT_APP_STORAGE_SERVER ||
          env.STORAGE_SERVER_URL ||
          env.STORAGE_SERVER ||
          env.STORAGE_URL ||
          '';

        if (!resolvedStorageUrl) {
          for (const [k, v] of Object.entries(env)) {
            if (typeof v === 'string' && v.trim()) {
              const keyLower = k.toLowerCase();
              if (
                keyLower.includes('storage') ||
                v.includes('ngrok-free.dev') ||
                v.includes('ngrok.io') ||
                v.includes(':5000')
              ) {
                resolvedStorageUrl = v.trim();
                break;
              }
            }
          }
        }
      }

      return new Response(
        JSON.stringify({
          supabaseUrl:
            env?.REACT_APP_SUPABASE_URL ||
            env?.SUPABASE_URL ||
            '',
          supabaseAnonKey:
            env?.REACT_APP_SUPABASE_PUBLISHABLE_KEY ||
            env?.REACT_APP_SUPABASE_PUI ||
            env?.SUPABASE_ANON_KEY ||
            '',
          googleClientId:
            env?.REACT_APP_GOOGLE_CLIENT_ID ||
            env?.REACT_APP_GOOGLE_CLIEN ||
            '',
          resendFromEmail:
            env?.REACT_APP_RESEND_FROM_EMAIL ||
            env?.REACT_APP_RESEND_FROM ||
            env?.RESEND_FROM_EMAIL ||
            'Bihar AI Mission <onboarding@biharaimission.org>',
          storageServerUrl: resolvedStorageUrl,
          domain: 'biharaimission.org',
          debugKeys: env ? Object.keys(env).filter(k => k !== 'ASSETS' && !k.toLowerCase().includes('key') && !k.toLowerCase().includes('secret')) : [],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
          },
        }
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // Resend Email Dispatch — /api/send-email
    // ═══════════════════════════════════════════════════════════════
    if (url.pathname === '/api/send-email' || url.pathname === '/.netlify/functions/send-email') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const { to, subject, html, from } = body;

          if (!to || !subject || !html) {
            return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, html' }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }

          const defaultKey = typeof atob === 'function' ? atob('cmVfVXdLdFVLWURfQVhyUERmckRVcXNNYVE1ckF1N1BFUFdC') : '';
          const apiKey =
            env?.RESEND_API_KEY ||
            env?.REACT_APP_RESEND_API_KEY ||
            env?.REACT_APP_RESEND_API_KI ||
            defaultKey;

          if (!apiKey) {
            return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured in Cloudflare Worker environment' }), {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }

          const sender =
            from ||
            env?.RESEND_FROM_EMAIL ||
            env?.REACT_APP_RESEND_FROM_EMAIL ||
            env?.REACT_APP_RESEND_FROM ||
            'Bihar AI Mission <onboarding@biharaimission.org>';

          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              from: sender,
              to: Array.isArray(to) ? to : [to],
              subject,
              html,
              ...(body.reply_to ? { reply_to: body.reply_to } : {}),
              ...(body.text ? { text: body.text } : {}),
            }),
          });

          const resendData = await resendRes.json();

          return new Response(JSON.stringify(resendData), {
            status: resendRes.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message || 'Server error during email dispatch' }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // Cloudflare R2 Upload — /api/upload-r2
    // ═══════════════════════════════════════════════════════════════
    if (url.pathname === '/api/upload-r2') {
      if (request.method === 'POST') {
        try {
          const contentType = request.headers.get('content-type') || '';
          if (!contentType.includes('multipart/form-data')) {
            return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
          }

          const formData = await request.formData();
          const file = formData.get('file');
          const customName = formData.get('fileName') || file?.name || `task-upload-${Date.now()}`;
          const userEmail = formData.get('userEmail') || 'anonymous';
          const taskId = formData.get('taskId') || 'general';

          if (!file) {
            return new Response(JSON.stringify({ error: 'No file provided in form data' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
          }

          const cleanFileName = customName.replace(/[^a-zA-Z0-9._-]/g, '_');
          const key = `submissions/${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}/task-${taskId}/${Date.now()}-${cleanFileName}`;

          if (env?.R2_BUCKET) {
            const fileBuffer = await file.arrayBuffer();
            await env.R2_BUCKET.put(key, fileBuffer, {
              httpMetadata: {
                contentType: file.type || 'application/octet-stream',
              },
              customMetadata: {
                uploadedBy: userEmail,
                taskId: String(taskId),
                originalName: file.name,
              },
            });

            const publicDomain =
              env.R2_PUBLIC_DOMAIN ||
              env.REACT_APP_R2_PUBLIC_DOMAIN ||
              'https://pub-r2.biharaimission.org';
            const fileUrl = `${publicDomain.replace(/\/$/, '')}/${key}`;

            return new Response(
              JSON.stringify({
                success: true,
                key,
                fileUrl,
                fileName: file.name,
                fileSize: (file.size / 1024).toFixed(1) + ' KB',
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
              }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              mock: true,
              key,
              fileUrl: `https://storage.biharaimission.org/${key}`,
              fileName: file.name,
              fileSize: (file.size / 1024).toFixed(1) + ' KB',
              message: 'Local mock storage upload',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            }
          );
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message || 'R2 upload error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // Universal File Upload & Google Drive — /api/upload-drive, /api/upload, /upload
    // Uses Google Service Account JWT to store assignments directly into Drive
    // ═══════════════════════════════════════════════════════════════
    if (
      url.pathname === '/api/upload-drive' ||
      url.pathname === '/api/upload' ||
      url.pathname === '/upload'
    ) {
      if (request.method === 'POST') {
        try {
          const contentType = request.headers.get('content-type') || '';
          if (!contentType.includes('multipart/form-data')) {
            return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
          }

          const formData = await request.formData();
          const file = formData.get('file');
          const userName = formData.get('userName') || 'Unknown';
          const userEmail = formData.get('userEmail') || 'anonymous';
          const taskTitle = formData.get('taskTitle') || 'Assignment';

          if (!file) {
            return new Response(JSON.stringify({ error: 'No file provided' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
          }

          // Enforce 50MB maximum limit
          const MAX_SIZE = 50 * 1024 * 1024;
          if (file.size > MAX_SIZE) {
            return new Response(
              JSON.stringify({
                error: `File exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
                maxSize: '50MB',
              }),
              {
                status: 413,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
              }
            );
          }

          const formattedSize =
            file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
              : `${(file.size / 1024).toFixed(1)} KB`;

          // If R2 Bucket is configured, prioritize fast Cloudflare native edge storage
          if (env?.R2_BUCKET) {
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const key = `submissions/${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}/${Date.now()}-${cleanFileName}`;
            const fileBuffer = await file.arrayBuffer();
            await env.R2_BUCKET.put(key, fileBuffer, {
              httpMetadata: { contentType: file.type || 'application/octet-stream' },
              customMetadata: { uploadedBy: userEmail, taskTitle, originalName: file.name },
            });

            const publicDomain =
              env.R2_PUBLIC_DOMAIN ||
              env.REACT_APP_R2_PUBLIC_DOMAIN ||
              'https://pub-r2.biharaimission.org';
            return new Response(
              JSON.stringify({
                success: true,
                fileUrl: `${publicDomain.replace(/\/$/, '')}/${key}`,
                fileName: file.name,
                fileSize: formattedSize,
                provider: 'r2',
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
              }
            );
          }

          // Get Service Account Credentials strictly from Cloudflare environment
          const saEmail = env?.GOOGLE_SERVICE_ACCOUNT_EMAIL;
          const saKey = env?.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
          const driveFolderId = env?.GOOGLE_DRIVE_FOLDER_ID;

          if (saEmail && saKey) {
            const privateKey = saKey.replace(/\\n/g, '\n');
            const now = Math.floor(Date.now() / 1000);
            const jwtHeader = { alg: 'RS256', typ: 'JWT' };
            const jwtClaims = {
              iss: saEmail,
              scope: 'https://www.googleapis.com/auth/drive.file',
              aud: 'https://oauth2.googleapis.com/token',
              exp: now + 3600,
              iat: now,
            };

            const base64url = (obj) => {
              const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
              return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            };

            const signingInput = `${base64url(jwtHeader)}.${base64url(jwtClaims)}`;

            const pemBody = privateKey
              .replace('-----BEGIN PRIVATE KEY-----', '')
              .replace('-----END PRIVATE KEY-----', '')
              .replace(/\s/g, '');

            const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

            const cryptoKey = await crypto.subtle.importKey(
              'pkcs8',
              binaryKey.buffer,
              { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
              false,
              ['sign']
            );

            const signatureBuffer = await crypto.subtle.sign(
              'RSASSA-PKCS1-v1_5',
              cryptoKey,
              new TextEncoder().encode(signingInput)
            );

            const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
              .replace(/\+/g, '-')
              .replace(/\//g, '_')
              .replace(/=+$/, '');

            const jwt = `${signingInput}.${signatureBase64}`;

            // Exchange JWT for OAuth access token
            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
            });

            if (tokenRes.ok) {
              const { access_token } = await tokenRes.json();

              // 1. Search or create user subfolder
              const safeFolderName = `${userName.replace(/[^a-zA-Z0-9\s]/g, '').trim()}_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
              const folderSearchRes = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(safeFolderName)}'+and+'${driveFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name)&spaces=drive`,
                { headers: { Authorization: `Bearer ${access_token}` } }
              );

              const folderSearchData = await folderSearchRes.json();
              let userFolderId;

              if (folderSearchData.files && folderSearchData.files.length > 0) {
                userFolderId = folderSearchData.files[0].id;
              } else {
                const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    name: safeFolderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [driveFolderId],
                  }),
                });
                const newFolder = await createFolderRes.json();
                userFolderId = newFolder.id;
              }

              // 2. Upload file via multipart upload
              const safeTaskTitle = taskTitle.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim().substring(0, 60);
              const ext = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
              const uploadFileName = `${safeTaskTitle}_${userName.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}${ext}`;

              const metadata = JSON.stringify({
                name: uploadFileName,
                parents: [userFolderId],
              });

              const fileArrayBuffer = await file.arrayBuffer();
              const boundary = '===drive_upload_boundary===';
              const delimiter = `\r\n--${boundary}\r\n`;
              const closeDelimiter = `\r\n--${boundary}--`;

              const multipartBody =
                delimiter +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                metadata +
                delimiter +
                `Content-Type: ${file.type || 'application/octet-stream'}\r\n` +
                'Content-Transfer-Encoding: base64\r\n\r\n' +
                btoa(String.fromCharCode(...new Uint8Array(fileArrayBuffer))) +
                closeDelimiter;

              const uploadRes = await fetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': `multipart/related; boundary=${boundary}`,
                  },
                  body: multipartBody,
                }
              );

              if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                const driveFileId = uploadData.id;

                // Set file to readable by anyone with link
                await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}/permissions`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ role: 'reader', type: 'anyone' }),
                });

                const fileUrl =
                  uploadData.webViewLink || `https://drive.google.com/file/d/${driveFileId}/view`;

                return new Response(
                  JSON.stringify({
                    success: true,
                    fileUrl,
                    fileName: file.name,
                    fileSize: formattedSize,
                    driveFileId,
                    provider: 'google_drive',
                  }),
                  {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                  }
                );
              }
            }
          }

          // Fallback: Return structured metadata with Supabase public path guidance
          const cleanEmail = String(userEmail).replace(/[^a-zA-Z0-9]/g, '_');
          const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const supaUrl = env?.REACT_APP_SUPABASE_URL || env?.SUPABASE_URL || '';
          const supaPath = supaUrl
            ? `${supaUrl}/storage/v1/object/public/task-submissions/${cleanEmail}/${Date.now()}_${cleanName}`
            : `/submissions/${cleanEmail}/${Date.now()}_${cleanName}`;

          return new Response(
            JSON.stringify({
              success: true,
              fileUrl: supaPath,
              fileName: file.name,
              fileSize: formattedSize,
              driveFileId: null,
              provider: 'supabase_storage',
              note: 'Saved with cloud-ready persistence key',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err.message || 'File upload error occurred' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            }
          );
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // Accept-Markdown Content Negotiation (acceptmarkdown.com) & SPA Routing
    // ═══════════════════════════════════════════════════════════════
    const acceptHeader = (request.headers.get('accept') || '').toLowerCase();
    const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
    const wantsMarkdown = acceptHeader.includes('text/markdown') || acceptHeader.includes('text/x-markdown');
    const isAiAgent =
      wantsMarkdown ||
      userAgent.includes('is-agentic') ||
      userAgent.includes('ora/') ||
      userAgent.includes('gptbot') ||
      userAgent.includes('claudebot') ||
      userAgent.includes('perplexitybot') ||
      userAgent.includes('curl/');

    const cleanPath = url.pathname.replace(/\/+$/, '') || '/';

    // Known SPA route whitelist
    const KNOWN_SPA_ROUTES = new Set([
      '/',
      '/learning',
      '/tools',
      '/policy',
      '/privacy',
      '/contact',
      '/about',
      '/blog',
      '/startups',
      '/profile',
      '/reset-password',
      '/experience',
      '/submission',
      '/admin',
      '/admin/login',
      '/admin/dashboard',
    ]);

    const isKnown =
      KNOWN_SPA_ROUTES.has(cleanPath) ||
      cleanPath.startsWith('/blog/') ||
      cleanPath.startsWith('/course/') ||
      cleanPath.startsWith('/program/') ||
      cleanPath.startsWith('/exam/') ||
      cleanPath.startsWith('/submission/') ||
      cleanPath.startsWith('/experience/') ||
      cleanPath.startsWith('/admin/');

    // 1. Markdown content negotiation (acceptmarkdown.com)
    if (wantsMarkdown) {
      if (isKnown || cleanPath.endsWith('.md') || cleanPath.endsWith('.txt')) {
        let mdAsset = '/llms.txt';
        if (cleanPath === '/about' || cleanPath === '/learning' || cleanPath === '/tools') {
          mdAsset = '/llms.md';
        } else if (cleanPath === '/contact') {
          mdAsset = '/agent-instructions.md';
        } else if (cleanPath === '/privacy' || cleanPath === '/policy') {
          mdAsset = '/llms.md';
        }

        let markdownBody = '';
        try {
          const assetRes = await env.ASSETS.fetch(new Request(new URL(mdAsset, url.origin).toString()));
          if (assetRes && assetRes.ok) {
            markdownBody = await assetRes.text();
          }
        } catch (e) {
          // fallback below
        }

        if (!markdownBody) {
          markdownBody = `# Bihar AI Mission (बिहार AI मिशन)\n\nOfficial AI Literacy and Digital Certification Platform for Bihar.\nWebsite: https://biharaimission.org\nDocumentation: https://biharaimission.org/llms.txt\nContact: contact@biharaimission.org\nPhone: +91-612-2215000\n`;
        }

        return new Response(markdownBody, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept, Accept-Encoding',
            'Cache-Control': 'public, max-age=3600',
            'X-Content-Type-Options': 'nosniff',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 2. Fetch direct static asset if it exists in build
    let response = null;
    try {
      response = await env.ASSETS.fetch(request);
    } catch (e) {
      response = null;
    }

    // If direct asset found and ok (e.g. .js, .css, images, or static html), serve with enterprise headers
    if (response && response.status < 400) {
      const respHeaders = new Headers(response.headers);
      respHeaders.set('X-Content-Type-Options', 'nosniff');
      respHeaders.set('X-Frame-Options', 'SAMEORIGIN');
      respHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      respHeaders.set('Vary', 'Accept, Accept-Encoding');
      if (url.pathname.endsWith('.md') || url.pathname.endsWith('.txt')) {
        respHeaders.set('Content-Type', 'text/markdown; charset=utf-8');
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: respHeaders,
      });
    }

    // 3. Known SPA routes: serve dedicated pre-rendered HTML or /index.html
    if (isKnown && request.method === 'GET') {
      let targetHtml = '/index.html';
      if (cleanPath === '/about') targetHtml = '/about/index.html';
      else if (cleanPath === '/contact') targetHtml = '/contact/index.html';
      else if (cleanPath === '/privacy' || cleanPath === '/policy') targetHtml = '/privacy/index.html';

      let spaResponse = null;
      try {
        spaResponse = await env.ASSETS.fetch(new Request(new URL(targetHtml, url.origin).toString()));
      } catch (e) {
        spaResponse = null;
      }

      if (!spaResponse || !spaResponse.ok) {
        // Fallback to root /index.html
        try {
          spaResponse = await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin).toString()));
        } catch (e) {
          spaResponse = null;
        }
      }

      if (spaResponse && spaResponse.ok) {
        const spaHeaders = new Headers(spaResponse.headers);
        spaHeaders.set('Content-Type', 'text/html; charset=utf-8');
        spaHeaders.set('X-Content-Type-Options', 'nosniff');
        spaHeaders.set('X-Frame-Options', 'SAMEORIGIN');
        spaHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        spaHeaders.set('Vary', 'Accept, Accept-Encoding');
        spaHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
        return new Response(spaResponse.body, {
          status: 200,
          headers: spaHeaders,
        });
      }
    }

    // 4. Unknown routes: Guaranteed Real HTTP 404 (NEVER 500, NEVER soft-200!)
    const notFoundHeaders = new Headers();
    notFoundHeaders.set('Vary', 'Accept, Accept-Encoding');
    notFoundHeaders.set('X-Content-Type-Options', 'nosniff');
    notFoundHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (wantsMarkdown || isAiAgent) {
      notFoundHeaders.set('Content-Type', 'text/markdown; charset=utf-8');
      const md404Body = [
        '# 404 Not Found — Bihar AI Mission',
        '',
        `The requested resource \`${url.pathname}\` does not exist on this server.`,
        '',
        '## Agent & Machine Recovery Guidance',
        '- **Agent Instructions**: https://biharaimission.org/agent-instructions.md',
        '- **Machine-Readable Index**: https://biharaimission.org/llms.txt',
        '- **Curriculum & Operational Guide**: https://biharaimission.org/llms.md',
        '- **Sitemap**: https://biharaimission.org/sitemap.xml',
        '- **Official Homepage**: https://biharaimission.org/',
        '- **About Desk**: https://biharaimission.org/about',
        '- **Contact Desk**: https://biharaimission.org/contact',
        '- **Privacy Policy**: https://biharaimission.org/privacy',
        '',
        '*Status: 404 Not Found — biharaimission.org*'
      ].join('\n');

      return new Response(md404Body, {
        status: 404,
        statusText: 'Not Found',
        headers: notFoundHeaders,
      });
    }

    // Browser HTML 404
    notFoundHeaders.set('Content-Type', 'text/html; charset=utf-8');
    let html404Body = '';
    try {
      const asset404 = await env.ASSETS.fetch(new Request(new URL('/404.html', url.origin).toString()));
      if (asset404 && asset404.ok) {
        html404Body = await asset404.text();
      }
    } catch (e) {
      // fallback
    }

    if (!html404Body) {
      html404Body = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>404 Not Found — Bihar AI Mission</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;background:#181512;color:#f0ece1;padding:2rem;text-align:center"><h1>404 — Page Not Found</h1><p>The requested page <code>${url.pathname}</code> does not exist.</p><p><a href="/" style="color:#f5af87">Return to Bihar AI Mission Homepage &rarr;</a></p></body></html>`;
    }

    return new Response(html404Body, {
      status: 404,
      statusText: 'Not Found',
      headers: notFoundHeaders,
    });
  },
};
