import { supabase } from '../supabaseClient';

/**
 * Upload a file to a Supabase storage bucket
 * @param {File} file - The file to upload
 * @param {string} bucketName - The name of the bucket to upload to
 * @param {string} fileName - The name to give the file in storage (optional)
 * @param {string} authToken - Authentication token for authorized uploads (optional)
 * @param {boolean} isPublic - Whether the upload should be public (default: true)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const uploadFileToStorage = async (file, bucketName, fileName = null, authToken = null, isPublic = true) => {
  try {
    // Generate a unique file name if not provided
    const finalFileName = fileName || `${Date.now()}_${file.name}`;
    
    console.log('Attempting to upload file:', {
      bucketName,
      fileName: finalFileName,
      fileSize: file.size,
      fileType: file.type,
      isPublic
    });
    
    // Debug: Check current user session
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Authenticated' : 'Not authenticated');
    if (session) {
      console.log('User ID:', session.user.id);
    }
    
    // Debug: Check if bucket exists and is accessible
    try {
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketError) {
        console.warn('Failed to list buckets:', bucketError);
      } else {
        const targetBucket = buckets.find(b => b.name === bucketName);
        console.log('Target bucket info:', targetBucket || 'Not found');
      }
    } catch (bucketCheckError) {
      console.warn('Bucket check error:', bucketCheckError);
    }
    
    // Try to upload with more permissive options
    const uploadOptions = {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream'
    };
    
    console.log('Upload options:', uploadOptions);
    
    // Upload the file to the specified bucket
    let { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(finalFileName, file, uploadOptions);
    
    if (error) {
      console.error('Upload failed with detailed error info:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        details: error.details
      });
      
      // Try a different approach - upload to a subfolder
      console.log('Trying alternative upload approach...');
      const altFileName = `uploads/${finalFileName}`;
      
      const { data: altData, error: altError } = await supabase
        .storage
        .from(bucketName)
        .upload(altFileName, file, uploadOptions);
      
      if (altError) {
        console.error('Alternative upload also failed:', {
          message: altError.message,
          statusCode: altError.statusCode,
          error: altError.error,
          details: altError.details
        });
        
        // Provide more specific error messages based on error type
        if (altError.statusCode === '42501' || altError.message.includes('row-level security') || altError.message.includes('permission')) {
          return { 
            success: false, 
            error: `Permission denied: ${altError.message}. This is likely due to bucket policy restrictions. Try checking: 1) Bucket exists, 2) Policies allow INSERT, 3) User has correct permissions, 4) Bucket RLS is properly configured.` 
          };
        }
        
        if (altError.statusCode === '400') {
          return { 
            success: false, 
            error: `Bad request: ${altError.message}. Check file format and size limits.` 
          };
        }
        
        if (altError.statusCode === '404') {
          return { 
            success: false, 
            error: `Bucket not found: ${bucketName}. Please verify the bucket exists in your Supabase storage.` 
          };
        }
        
        return { success: false, error: `Upload failed: ${altError.message} (Code: ${altError.statusCode})` };
      }
      
      // Success with alternative approach
      data = altData;
    }

    console.log('File uploaded successfully:', data);
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(data.path || finalFileName);

    console.log('Public URL generated:', publicUrl);

    return { 
      success: true, 
      data: { 
        path: data.path, 
        publicUrl: publicUrl 
      } 
    };
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    return { success: false, error: `Unexpected error: ${error.message || 'Unknown error occurred'}` };
  }
};

/**
 * Upload multiple files to a Supabase storage bucket
 * @param {FileList|File[]} files - The files to upload
 * @param {string} bucketName - The name of the bucket to upload to
 * @param {string} authToken - Authentication token for authorized uploads (optional)
 * @param {boolean} isPublic - Whether the upload should be public (default: true)
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const uploadMultipleFilesToStorage = async (files, bucketName, authToken = null, isPublic = true) => {
  try {
    const uploadPromises = Array.from(files).map(file => 
      uploadFileToStorage(file, bucketName, null, authToken, isPublic)
    );
    
    const results = await Promise.all(uploadPromises);
    
    // Check if all uploads were successful
    const allSuccessful = results.every(result => result.success);
    
    if (!allSuccessful) {
      const errors = results
        .filter(result => !result.success)
        .map(result => result.error);
      
      return { 
        success: false, 
        error: `Some uploads failed: ${errors.join(', ')}` 
      };
    }
    
    // Return the data from all successful uploads
    const uploadedFiles = results.map(result => result.data);
    
    return { success: true, data: uploadedFiles };
  } catch (error) {
    console.error('Unexpected error during multiple file upload:', error);
    return { success: false, error: `Unexpected error: ${error.message || 'Unknown error occurred'}` };
  }
};

/**
 * Delete a file from a Supabase storage bucket
 * @param {string} filePath - The path of the file to delete
 * @param {string} bucketName - The name of the bucket to delete from
 * @param {string} authToken - Authentication token for authorized deletions (optional)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFileFromStorage = async (filePath, bucketName, authToken = null) => {
  try {
    const { error } = await supabase
      .storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: `Delete failed: ${error.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error during file deletion:', error);
    return { success: false, error: `Unexpected error: ${error.message || 'Unknown error occurred'}` };
  }
};