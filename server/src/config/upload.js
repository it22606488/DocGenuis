const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log('Upload destination:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const fileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar/;
  
  // Check extension
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check for valid mime types (more inclusive approach)
  let mimeValid = false;
  
  // Common mime type mappings
  const mimeTypes = {
    'text/plain': ['txt', 'csv'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'application/vnd.ms-powerpoint': ['ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'application/zip': ['zip'],
    'application/x-rar-compressed': ['rar'],
    'application/octet-stream': ['*'] // Fallback for some file types
  };
  
  // Check if the file's mime type is in our allowed list
  for (const [mimeType, extensions] of Object.entries(mimeTypes)) {
    if (file.mimetype === mimeType || 
       (file.mimetype.startsWith('text/') && path.extname(file.originalname).toLowerCase() === '.txt')) {
      mimeValid = true;
      break;
    }
  }
  
  // Special case for text files with different mime types
  if (!mimeValid && path.extname(file.originalname).toLowerCase() === '.txt') {
    mimeValid = true;
  }
  
  console.log('File upload check:', {
    filename: file.originalname,
    mimetype: file.mimetype,
    extValid: extname,
    mimeValid: mimeValid
  });

  if (extname && mimeValid) {
    return cb(null, true);
  } else {
    cb(new Error(`Error: Unsupported file type! Only ${fileTypes} are allowed`));
  }
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter
});

console.log('Multer upload configuration loaded');
module.exports = upload; 