const { supabase } = require('../config/database');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const folderPath = path.join(uploadDir, folder);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

/**
 * Upload single image
 */
const uploadSingle = upload.single('image');

/**
 * Upload multiple images
 */
const uploadMultiple = upload.array('images', 10);

/**
 * Upload image handler
 * POST /api/media/upload
 */
const uploadImage = asyncHandler(async (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const folder = req.body.folder || 'general';
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = `${folder}/${req.file.filename}`;
    const fileUrl = `${baseUrl}/uploads/${relativePath}`;

    // Save to database
    const { data: media, error } = await supabase
      .from('media')
      .insert({
        filename: req.file.filename,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        alt_text: req.body.alt_text || '',
        uploaded_by: req.user?.id,
        folder,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // Delete file if database save fails
      fs.unlinkSync(req.file.path);
      throw new ApiError(500, 'Failed to save media information');
    }

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: media
    });
  });
});

/**
 * Upload multiple images
 * POST /api/media/upload-multiple
 */
const uploadImages = asyncHandler(async (req, res) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const folder = req.body.folder || 'general';
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const mediaRecords = [];
    const errors = [];

    for (const file of req.files) {
      const relativePath = `${folder}/${file.filename}`;
      const fileUrl = `${baseUrl}/uploads/${relativePath}`;

      const { data: media, error } = await supabase
        .from('media')
        .insert({
          filename: file.filename,
          original_name: file.originalname,
          mime_type: file.mimetype,
          size: file.size,
          url: fileUrl,
          uploaded_by: req.user?.id,
          folder,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        errors.push({ file: file.originalname, error: error.message });
        fs.unlinkSync(file.path);
      } else {
        mediaRecords.push(media);
      }
    }

    res.status(201).json({
      success: true,
      message: `${mediaRecords.length} images uploaded successfully`,
      data: mediaRecords,
      errors: errors.length > 0 ? errors : undefined
    });
  });
});

/**
 * Get all media
 * GET /api/media
 */
const getMedia = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, folder, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('media')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (folder) {
    query = query.eq('folder', folder);
  }

  if (search) {
    query = query.or(`original_name.ilike.%${search}%,alt_text.ilike.%${search}%`);
  }

  const { data: media, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new ApiError(500, 'Failed to fetch media');
  }

  res.status(200).json({
    success: true,
    data: media,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * Get single media
 * GET /api/media/:id
 */
const getMediaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: media, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !media) {
    throw new ApiError(404, 'Media not found');
  }

  res.status(200).json({
    success: true,
    data: media
  });
});

/**
 * Update media
 * PUT /api/media/:id
 */
const updateMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { alt_text, folder } = req.body;

  const updateData = {};
  if (alt_text !== undefined) updateData.alt_text = alt_text;
  if (folder !== undefined) updateData.folder = folder;

  const { data: media, error } = await supabase
    .from('media')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !media) {
    throw new ApiError(404, 'Media not found or update failed');
  }

  res.status(200).json({
    success: true,
    message: 'Media updated successfully',
    data: media
  });
});

/**
 * Delete media
 * DELETE /api/media/:id
 */
const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get media info first
  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !media) {
    throw new ApiError(404, 'Media not found');
  }

  // Delete file from filesystem
  const filePath = path.join(uploadDir, media.folder, media.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Delete from database
  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, 'Failed to delete media');
  }

  res.status(200).json({
    success: true,
    message: 'Media deleted successfully'
  });
});

/**
 * Get folders
 * GET /api/media/folders
 */
const getFolders = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('media')
    .select('folder');

  if (error) {
    throw new ApiError(500, 'Failed to fetch folders');
  }

  const folders = [...new Set(data.map(item => item.folder).filter(Boolean))];

  res.status(200).json({
    success: true,
    data: folders
  });
});

module.exports = {
  uploadImage,
  uploadImages,
  getMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  getFolders
};