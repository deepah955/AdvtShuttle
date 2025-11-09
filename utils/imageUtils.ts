import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/services/firebase';

/**
 * Get bus marker icon for a specific route
 * Uses SVG bus icon with route-specific colors (no Jimp dependency, no file system)
 * This is synchronous and works perfectly for map markers
 */
export const getBusMarkerForRoute = (routeId: string): string => {
  const colorMap: Record<string, string> = {
    'lh-prp': '#007AFF', // Blue
    'mh': '#FF9500',     // Orange
  };
  
  const color = colorMap[routeId] || '#007AFF';
  
  // Return SVG bus icon with route color - no async, no Jimp, no file system
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="${color}" stroke="white" stroke-width="2"/>
      <path d="M20 24H8V25C8 25.5523 7.55228 26 7 26H6C5.44772 26 5 25.5523 5 25V14L3.4453 13.2226C3.17514 13.0875 3 12.8148 3 12.5157V11C3 10.4477 3.44772 10 4 10H5V7C5 5.89543 5.89543 5 7 5H19C20.1046 5 21 5.89543 21 7V10H22C22.5523 10 23 10.4477 23 11V12.5157C23 12.8148 22.8249 13.0875 22.5547 13.2226L21 14V25C21 25.5523 20.5523 26 20 26H19C18.4477 26 18 25.5523 18 25V24ZM7 7V10H19V7H7ZM7 12V20H19V12H7ZM8 14H12V18H8V14ZM14 14H18V18H14V14Z" fill="white"/>
    </svg>
  `;
  
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon);
};

export const uploadProfilePhoto = async (
  uri: string,
  userId: string
): Promise<string> => {
  try {
    console.log('Starting photo upload for user:', userId);
    console.log('Photo URI:', uri);

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `profilePhotos/${userId}_${timestamp}.jpg`;
    
    // Create storage reference
    const storageRef = ref(storage, filename);
    console.log('Storage reference created:', filename);

    // For React Native, we need to handle the file differently
    let blob: Blob;
    
    if (uri.startsWith('file://') || uri.startsWith('content://')) {
      // Mobile file URI - convert to blob
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      blob = await response.blob();
      console.log('Blob created from mobile URI, size:', blob.size);
    } else if (uri.startsWith('data:')) {
      // Base64 data URI - convert to blob
      const base64Data = uri.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: 'image/jpeg' });
      console.log('Blob created from base64, size:', blob.size);
    } else {
      // Web file URI - fetch directly
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      blob = await response.blob();
      console.log('Blob created from web URI, size:', blob.size);
    }

    if (blob.size === 0) {
      throw new Error('File is empty or could not be read');
    }

    if (blob.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    console.log('Starting upload to Firebase Storage...');
    
    // Upload file with metadata
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        userId: userId,
        uploadedAt: new Date().toISOString()
      }
    };

    const uploadTask = await uploadBytes(storageRef, blob, metadata);
    console.log('Upload completed successfully');
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadTask.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error('Upload profile photo error:', error);
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('Permission denied. Please check Firebase Storage rules.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Unknown error occurred during upload.');
    } else if (error.code === 'storage/invalid-format') {
      throw new Error('Invalid file format. Please select a valid image.');
    } else if (error.code === 'storage/invalid-argument') {
      throw new Error('Invalid file. Please select a different image.');
    } else if (error.message.includes('fetch')) {
      throw new Error('Could not read the selected image. Please try selecting a different photo.');
    } else if (error.message.includes('network')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else {
      throw new Error(error.message || 'Failed to upload photo. Please try again.');
    }
  }
};

