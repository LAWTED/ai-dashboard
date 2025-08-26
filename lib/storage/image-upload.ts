// Image upload utilities for Supabase Storage

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads an image file to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'diary-images')
 * @returns Promise with upload result containing the public URL
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: string = 'diary-images'
): Promise<ImageUploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Invalid file type. Please upload an image file.'
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 10MB.'
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `diary-images/${fileName}`;

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', filePath);
    formData.append('bucket', bucket);
    formData.append('uploadToSupabase', 'true'); // 确保上传到 Supabase 而不是返回 data URL

    // Upload via our API endpoint
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Upload failed'
      };
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url
    };

  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: 'Upload failed due to network error'
    };
  }
}

/**
 * Uploads multiple images to Supabase Storage
 * @param files - Array of image files to upload
 * @param bucket - The storage bucket name (default: 'diary-images')
 * @returns Promise with array of upload results
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: string = 'diary-images'
): Promise<ImageUploadResult[]> {
  const uploadPromises = files.map(file => uploadImageToSupabase(file, bucket));
  return Promise.all(uploadPromises);
}

/**
 * Uploads data URL images to Supabase Storage
 * @param dataUrls - Array of data URLs to upload
 * @param bucket - The storage bucket name (default: 'diary-images')
 * @returns Promise with array of upload results
 */
export async function uploadDataUrlsToSupabase(
  dataUrls: string[],
  bucket: string = 'diary-images'
): Promise<ImageUploadResult[]> {
  const uploadPromises = dataUrls.map(async (dataUrl) => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create a File object from blob
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${blob.type.split('/')[1]}`;
      const file = new File([blob], fileName, { type: blob.type });
      
      // Upload using existing function
      return await uploadImageToSupabase(file, bucket);
    } catch (error) {
      console.error('Error uploading data URL:', error);
      return {
        success: false,
        error: 'Failed to upload image'
      };
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * Validates image file before upload
 * @param file - The file to validate
 * @returns Object with validation result
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Invalid file type. Please select an image file.'
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please select an image smaller than 10MB.'
    };
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported format. Please use JPEG, PNG, WebP, or GIF.'
    };
  }

  return { valid: true };
}