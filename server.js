const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_URL = process.env.PUBLIC_URL || '';
const STORAGE_SECRET = process.env.STORAGE_SECRET || process.env.ADMIN_SECRET || 'bihar_ai_internal_storage_key_2026';

// 1. Enforce Critical Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// 2. Parse JSON request bodies
app.use(express.json({ limit: '2mb' }));

// 3. Strict CORS Origin Filtering (No open wildcard '*')
const ALLOWED_ORIGINS = [
  'https://biharaimission.org',
  'https://www.biharaimission.org',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://localhost:3001'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.biharaimission.org') || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-storage-secret, ngrok-skip-browser-warning, *');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.biharaimission.org') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy: Origin not allowed'));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));

// Uploads directory: D:\Bihar_Ai_Mission\uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}_${cleanName}`);
  }
});

// 4. File Upload Whitelist & Prohibited Extension Verification
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.doc', '.docx', '.zip', '.txt', '.csv']);
const DANGEROUS_EXTENSIONS = new Set(['.exe', '.bat', '.cmd', '.sh', '.php', '.py', '.js', '.mjs', '.svg', '.html', '.htm', '.jsp', '.asp', '.vbs']);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return cb(new Error(`Security rejection: Executables, scripts, HTML, and SVG files (${ext}) are prohibited.`), false);
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Unsupported file type (${ext}). Allowed formats: PDF, PNG, JPG, WEBP, DOC, DOCX, ZIP, TXT.`), false);
  }

  cb(null, true);
};

// Max limit: 50MB per file with fileFilter
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Health check endpoint
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'Bihar AI Storage Microservice Running (Harden Security Active)',
    timestamp: new Date().toISOString()
  });
});

// Handle upload for both /upload and /api/upload
const handleUpload = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or file rejected by security policy' });
    }

    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = PUBLIC_URL || `${protocol}://${host}`;
    const fileUrl = `${baseUrl.replace(/\/+$/, '')}/files/${req.file.filename}`;

    const formattedSize = req.file.size > 1024 * 1024
      ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(req.file.size / 1024).toFixed(1)} KB`;

    console.log(`📥 Uploaded: ${req.file.originalname} -> ${req.file.filename} (${formattedSize})`);

    // Auto-delete previous file if resubmitting
    const oldTarget = req.body?.oldFileName || req.body?.oldFileUrl;
    if (oldTarget) {
      try {
        let oldClean = String(oldTarget);
        if (oldClean.includes('/files/')) oldClean = oldClean.split('/files/').pop().split('?')[0];
        else if (oldClean.includes('/') || oldClean.includes('\\')) oldClean = path.basename(oldClean);
        const oldSafe = path.basename(decodeURIComponent(oldClean));
        if (oldSafe && oldSafe !== '.' && oldSafe !== '..' && oldSafe !== req.file.filename) {
          const oldPath = path.join(uploadDir, oldSafe);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log(`🗑️ Auto-deleted old replaced file on resubmission: ${oldSafe}`);
          }
        }
      } catch (cleanErr) {
        console.warn('Old file cleanup note:', cleanErr.message);
      }
    }

    res.json({
      success: true,
      fileUrl: fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: formattedSize,
      size: req.file.size
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

app.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    handleUpload(req, res);
  });
});

app.post('/api/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    handleUpload(req, res);
  });
});

// 5. Handle file deletion (Protected to uploadDir via path.basename)
const handleDelete = (req, res) => {
  try {
    let rawTarget = req.params?.filename || req.body?.fileName || req.body?.fileUrl || req.query?.filename || '';
    
    // Extract base filename if full URL was provided
    if (rawTarget.includes('/files/')) {
      rawTarget = rawTarget.split('/files/').pop().split('?')[0];
    } else if (rawTarget.includes('/') || rawTarget.includes('\\')) {
      rawTarget = path.basename(rawTarget);
    }

    const safeFileName = path.basename(decodeURIComponent(rawTarget));
    if (!safeFileName || safeFileName === '.' || safeFileName === '..') {
      return res.status(400).json({ error: 'No filename provided' });
    }

    const targetFilePath = path.join(uploadDir, safeFileName);

    if (fs.existsSync(targetFilePath)) {
      fs.unlinkSync(targetFilePath);
      console.log(`🗑️ Deleted file from local storage: ${safeFileName}`);
      return res.json({ success: true, message: `File ${safeFileName} deleted successfully` });
    } else {
      console.log(`ℹ️ Delete requested but file not found (already removed): ${safeFileName}`);
      return res.json({ success: true, message: `File not found or already deleted` });
    }
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Failed to delete file', details: err.message });
  }
};

// Deletion endpoints
app.delete(['/files/:filename', '/api/files/:filename', '/delete-file', '/api/delete-file'], handleDelete);
app.post(['/delete-file', '/api/delete-file'], handleDelete);

// 6. Serve uploaded files safely with nosniff and sandbox CSP
app.use('/files', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  next();
}, express.static(uploadDir));

// ============================================================================
// 7. CHIT-CHAT (GUP-SHUP) DEDICATED LOCAL STORAGE & 15-DAY PURGE
// ============================================================================
const chitchatBaseDir = path.join(__dirname, 'Chit-chat');
const chitchatImageDir = path.join(chitchatBaseDir, 'image');
const chitchatVideoDir = path.join(chitchatBaseDir, 'video');
const chitchatAudioDir = path.join(chitchatBaseDir, 'audio');
const chitchatFilesDir = path.join(chitchatBaseDir, 'files');

[chitchatBaseDir, chitchatImageDir, chitchatVideoDir, chitchatAudioDir, chitchatFilesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const CHITCHAT_IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp']);
const CHITCHAT_VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.m4v', '.avi', '.mkv']);
const CHITCHAT_AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']);

function getChitChatCategory(ext) {
  if (CHITCHAT_IMAGE_EXTS.has(ext)) return 'image';
  if (CHITCHAT_VIDEO_EXTS.has(ext)) return 'video';
  if (CHITCHAT_AUDIO_EXTS.has(ext)) return 'audio';
  return 'files';
}

const chitchatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const category = getChitChatCategory(ext);
    if (category === 'image') cb(null, chitchatImageDir);
    else if (category === 'video') cb(null, chitchatVideoDir);
    else if (category === 'audio') cb(null, chitchatAudioDir);
    else cb(null, chitchatFilesDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}_${cleanName}`);
  }
});

const chitchatUpload = multer({
  storage: chitchatStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max for video/audio/files
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return cb(new Error(`Security rejection: Script and executable files (${ext}) are prohibited.`), false);
    }
    cb(null, true);
  }
});

// Chit-chat upload endpoint
app.post(['/api/chitchat/upload', '/chitchat/upload'], (req, res) => {
  chitchatUpload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = PUBLIC_URL || `${protocol}://${host}`;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const category = getChitChatCategory(ext);
    const fileUrl = `${baseUrl.replace(/\/+$/, '')}/chitchat/${category}/${req.file.filename}`;

    const formattedSize = req.file.size > 1024 * 1024
      ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(req.file.size / 1024).toFixed(1)} KB`;

    console.log(`💬 Chit-Chat Upload [${category}]: ${req.file.originalname} -> ${req.file.filename} (${formattedSize})`);

    res.json({
      success: true,
      fileUrl: fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mediaType: category,
      fileSize: formattedSize,
      size: req.file.size
    });
  });
});

// Serve Chit-Chat media files
app.use('/chitchat/image', express.static(chitchatImageDir));
app.use('/chitchat/video', (req, res, next) => {
  res.setHeader('Accept-Ranges', 'bytes');
  next();
}, express.static(chitchatVideoDir));
app.use('/chitchat/audio', express.static(chitchatAudioDir));
app.use('/chitchat/files', express.static(chitchatFilesDir));

// 15-Day Auto-Purge Routine: Deletes media older than 15 days
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

function purgeOldChitChatFiles() {
  const dirs = [chitchatImageDir, chitchatVideoDir, chitchatAudioDir, chitchatFilesDir];
  let totalPurged = 0;
  const now = Date.now();

  dirs.forEach((dir) => {
    try {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile() && (now - stats.mtimeMs > FIFTEEN_DAYS_MS)) {
            fs.unlinkSync(filePath);
            totalPurged++;
            console.log(`🧹 15-Day Purge: Deleted expired Chit-Chat file: ${file}`);
          }
        } catch (fileErr) {
          // ignore stat errors
        }
      });
    } catch (dirErr) {
      // ignore readdir errors
    }
  });

  if (totalPurged > 0) {
    console.log(`🗑️ Chit-Chat 15-Day Purge complete: ${totalPurged} expired files deleted.`);
  }
  return totalPurged;
}

// Run purge on startup (with small delay) and every 6 hours
setTimeout(purgeOldChitChatFiles, 4000);
setInterval(purgeOldChitChatFiles, 6 * 60 * 60 * 1000);

// Manual trigger endpoint for 15-day purge (supports GET & POST)
app.all(['/api/chitchat/purge-15days', '/chitchat/purge-15days', '/purge-15days', '/api/purge-15days'], (req, res) => {
  const purgedCount = purgeOldChitChatFiles();
  res.json({
    success: true,
    purgedCount,
    message: `15-day purge complete: ${purgedCount} expired files removed.`
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bihar AI Storage Server is running on: http://0.0.0.0:${PORT}`);
  console.log(`📁 Uploaded documents saved to: ${uploadDir}`);
  console.log(`💬 Chit-Chat media saved to: ${chitchatBaseDir}`);
});
