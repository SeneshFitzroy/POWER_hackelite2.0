// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Compress image before converting to base64
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to blob conversion failed'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Image loading failed'));
    img.src = URL.createObjectURL(file);
  });
};

// Upload file as base64
export const uploadFileAsBase64 = async (file, onProgress = null) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only images and PDF files are allowed.'
      };
    }
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      };
    }
    
    // Simulate progress
    if (onProgress) {
      onProgress(10);
    }
    
    // Compress image if it's too large and it's an image
    let processedFile = file;
    if (file.type.startsWith('image/') && file.size > 1024 * 1024) { // If larger than 1MB, compress
      processedFile = await compressImage(file);
    }
    
    if (onProgress) {
      onProgress(50);
    }
    
    // Convert to base64
    const base64String = await fileToBase64(processedFile);
    
    if (onProgress) {
      onProgress(100);
    }
    
    // Create metadata
    const metadata = {
      name: file.name,
      type: file.type,
      size: processedFile.size,
      uploadedAt: new Date().toISOString(),
      originalSize: file.size,
      compressed: file.size !== processedFile.size
    };
    
    return {
      success: true,
      base64: base64String,
      metadata: metadata
    };
  } catch (error) {
    console.error('Base64 conversion error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process file'
    };
  }
};

// Upload employee image as base64
export const uploadEmployeeImage = async (file, onProgress = null) => {
  return await uploadFileAsBase64(file, onProgress);
};

// Upload document as base64
export const uploadDocument = async (file, onProgress = null) => {
  return await uploadFileAsBase64(file, onProgress);
};
