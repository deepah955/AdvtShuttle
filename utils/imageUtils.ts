// Image utilities - Cloudinary Integration

import { apiRequest } from '@/services/api';

/**
 * Get bus marker icon for a specific route
 * Uses SVG bus icon with route-specific colors
 */
export const getBusMarkerForRoute = (routeId: string): string => {
  const colorMap: Record<string, string> = {
    'lh-prp': '#007AFF', // Blue
    'mh': '#FF9500',     // Orange
  };

  const color = colorMap[routeId] || '#007AFF';

  // Return SVG bus icon with route color
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="${color}" stroke="white" stroke-width="2"/>
      <path d="M20 24H8V25C8 25.5523 7.55228 26 7 26H6C5.44772 26 5 25.5523 5 25V14L3.4453 13.2226C3.17514 13.0875 3 12.8148 3 12.5157V11C3 10.4477 3.44772 10 4 10H5V7C5 5.89543 5.89543 5 7 5H19C20.1046 5 21 5.89543 21 7V10H22C22.5523 10 23 10.4477 23 11V12.5157C23 12.8148 22.8249 13.0875 22.5547 13.2226L21 14V25C21 25.5523 20.5523 26 20 26H19C18.4477 26 18 25.5523 18 25V24ZM7 7V10H19V7H7ZM7 12V20H19V12H7ZM8 14H12V18H8V14ZM14 14H18V18H14V14Z" fill="white"/>
    </svg>
  `;

  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon);
};

/**
 * Upload profile photo to Cloudinary via backend
 */
export const uploadProfilePhoto = async (
  uri: string,
  userId: string
): Promise<string> => {
  try {
    console.log('Starting photo upload for user:', userId);
    console.log('Photo URI:', uri);

    // Convert image to base64 if needed
    let base64Image: string;

    if (uri.startsWith('data:image')) {
      // Already base64
      base64Image = uri;
    } else if (uri.startsWith('file://') || uri.startsWith('content://')) {
      // Mobile file URI - convert to base64
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      base64Image = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // Web file URI - fetch directly
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      base64Image = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    console.log('Image converted to base64, uploading to Cloudinary...');

    // Upload to backend (which uploads to Cloudinary)
    const response = await apiRequest('/upload/profile', {
      method: 'POST',
      body: JSON.stringify({
        base64Image,
        userId
      })
    });

    console.log('Upload successful! URL:', response.imageUrl);
    return response.imageUrl;
  } catch (error: any) {
    console.error('Upload profile photo error:', error);

    // Provide user-friendly error messages
    if (error.message.includes('fetch')) {
      throw new Error('Could not read the selected image. Please try selecting a different photo.');
    } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else {
      throw new Error(error.message || 'Failed to upload photo. Please try again.');
    }
  }
};
