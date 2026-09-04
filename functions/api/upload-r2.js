/**
 * Cloudflare Pages Functions / API route for Cloudflare R2 file uploads
 * POST /api/upload-r2
 */

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Handle multipart form data
    if (contentType.includes('multipart/form-data')) {
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

      // Generate sanitized key
      const cleanFileName = customName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `submissions/${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}/task-${taskId}/${Date.now()}-${cleanFileName}`;

      // 1. Direct Cloudflare R2 Bucket Binding (if bound in Cloudflare dashboard as R2_BUCKET)
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
          }
        });

        const publicDomain = env.R2_PUBLIC_DOMAIN || env.REACT_APP_R2_PUBLIC_DOMAIN || 'https://pub-r2.biharaimission.org';
        const fileUrl = `${publicDomain.replace(/\/$/, '')}/${key}`;

        return new Response(JSON.stringify({
          success: true,
          key,
          fileUrl,
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(1) + ' KB'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // 2. Fallback response for dev / before R2 bucket binding is activated
      return new Response(JSON.stringify({
        success: true,
        mock: true,
        key,
        fileUrl: `https://storage.biharaimission.org/${key}`,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        message: 'Uploaded in local preview mode. Bind R2_BUCKET in Cloudflare for live persistence.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
