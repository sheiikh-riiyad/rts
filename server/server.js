const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------
   ✅ ULTIMATE CORS FIX
---------------------------------------------------*/
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://rts.italyembassy.site',
      'https://wordpress.italyembassy.site'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight for all routes
app.options('*', cors(corsOptions));

// Enhanced request logger
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('📋 Origin:', req.headers.origin);
  console.log('📝 Content-Type:', req.headers['content-type']);
  console.log('🔑 Headers:', req.headers);
  
  // Manually set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});

/* -------------------------------------------------
   ✅ TEMPORARY STORAGE FOR FILES
---------------------------------------------------*/
const upload = multer({
  dest: 'temp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, PDF allowed.'));
    }
  }
}).single('file');

/* -------------------------------------------------
   ✅ ROUTES
---------------------------------------------------*/

// Root check
app.get('/', (req, res) => {
  res.json({
    message: 'RTS File Server is running!',
    status: 'Active',
    timestamp: new Date().toISOString(),
    cors: 'Configured for all origins'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'running',
    cors: 'enabled'
  });
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS test successful!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    cors: 'working'
  });
});

/* -------------------------------------------------
   ✅ UPLOAD ENDPOINT - FIXED CORS
---------------------------------------------------*/
app.post('/upload', (req, res, next) => {
  console.log('🚀 /upload endpoint hit');
  console.log('📋 Origin:', req.headers.origin);
  console.log('🔧 Method:', req.method);
  
  // Set CORS headers manually for this route
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight');
    return res.status(200).end();
  }
  
  next();
}, upload, (req, res) => {
  console.log('📤 Processing file upload...');
  console.log('📦 Request body:', req.body);
  console.log('📁 File:', req.file);

  try {
    // Validate file and passport
    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    if (!req.body.passportNumber) {
      console.error('❌ Passport number missing');
      return res.status(400).json({ 
        success: false, 
        message: 'Passport number is required' 
      });
    }

    // Sanitize passport number
    const passportNumber = req.body.passportNumber.replace(/[^a-zA-Z0-9]/g, '');
    const uploadDir = path.join(__dirname, 'uploads', passportNumber);

    // Create upload directory if missing
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📂 Created directory:', uploadDir);
    }

    // Create final filename
    const ext = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, ext);
    const newFileName = `${baseName}_${Date.now()}${ext}`;
    const newPath = path.join(uploadDir, newFileName);

    // Move file from temp to final folder
    fs.renameSync(req.file.path, newPath);
    const filePath = `/uploads/${passportNumber}/${newFileName}`;

    console.log('✅ File uploaded successfully:', filePath);

    // Send response to frontend
    res.json({
      success: true,
      message: 'File uploaded successfully!',
      filePath,
      fileName: newFileName,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      passportNumber
    });

  } catch (error) {
    console.error('🔥 Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message
    });
  }
});

/* -------------------------------------------------
   ✅ SERVE STATIC FILES
---------------------------------------------------*/
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* -------------------------------------------------
   ✅ CORS ERROR HANDLER
---------------------------------------------------*/
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    console.error('❌ CORS Error:', err.message);
    return res.status(403).json({
      success: false,
      message: 'CORS policy: Origin not allowed'
    });
  }
  next(err);
});

/* -------------------------------------------------
   ✅ GLOBAL ERROR HANDLER
---------------------------------------------------*/
app.use((err, req, res, next) => {
  console.error('🔥 GLOBAL ERROR:', err.message);
  res.status(500).json({
    success: false,
    message: 'Server error: ' + err.message
  });
});

/* -------------------------------------------------
   ✅ START SERVER
---------------------------------------------------*/
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RTS File Server started on port ${PORT}`);
  console.log(`🌐 CORS enabled for:`);
  console.log(`   - http://localhost:3000`);
  console.log(`   - https://wordpress.italyembassy.site`);
  console.log(`   - https://rts.italyembassy.site`);
});
