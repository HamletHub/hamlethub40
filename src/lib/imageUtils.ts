/**
 * Utility functions for image URL handling
 */

/**
 * Converts an image URL or filename to a Google Cloud Storage URL
 * Handles three formats:
 * 1. AWS S3 URLs (legacy): https://hamlethub-prod-images.s3.amazonaws.com/original/filename.jpg
 * 2. Full GCS URLs: https://storage.googleapis.com/bucket-name/subfolder/filename.jpg
 * 3. Just filenames: filename.jpg
 * 
 * @param imageUrl - The original image URL or filename
 * @param subfolder - Optional subfolder for the image (e.g., "1_1", "original")
 * @returns The Google Cloud Storage URL
 */
export function convertToGcsUrl(imageUrl: string, subfolder?: string): string {
  // Return empty string if imageUrl is empty
  if (!imageUrl) {
    return '';
  }

  try {
    // Use environment variable for bucket name
    const bucketName = process.env.NEXT_PUBLIC_GCS_BUCKET_NAME || process.env.GCS_BUCKET_NAME;
    
    // Use the specified subfolder or default to "original"
    const targetSubfolder = subfolder || "original";

    // CASE 1: Handle AWS S3 URLs (legacy format)
    if (imageUrl.includes('s3.amazonaws.com')) {
      const urlParts = imageUrl.split('/');
      const objectName = urlParts[urlParts.length - 1];
      return `https://storage.googleapis.com/${bucketName}/${targetSubfolder}/${objectName}`;
    }
    
    // CASE 2: Handle full GCS URLs
    if (imageUrl.includes('storage.googleapis.com')) {
      // If it already has the correct subfolder, return as is
      if (imageUrl.includes(`/${targetSubfolder}/`)) {
        return imageUrl;
      }
      
      // Otherwise, extract the filename and reconstruct with the new subfolder
      const urlParts = imageUrl.split('/');
      const objectName = urlParts[urlParts.length - 1];
      return `https://storage.googleapis.com/${bucketName}/${targetSubfolder}/${objectName}`;
    }
    
    // CASE 3: Handle just filenames (no URL)
    // Check if it looks like just a filename (no slashes or only has extension)
    if (!imageUrl.includes('/') || imageUrl.match(/^[^\/]+\.[a-zA-Z0-9]+$/)) {
      return `https://storage.googleapis.com/${bucketName}/${targetSubfolder}/${imageUrl}`;
    }
    
    // If we couldn't determine the format, return as is
    return imageUrl;
  } catch (error) {
    console.error('Error converting image URL:', error);
    return imageUrl; // Return original URL in case of error
  }
}

/**
 * Processes HTML content and converts all AWS S3 image URLs to Google Cloud Storage URLs
 * 
 * @param htmlContent - The HTML content with possible S3 image URLs
 * @param subfolder - Optional subfolder for the images (e.g., "1_1", "original")
 * @returns The HTML content with updated GCS image URLs
 */
export function processHtmlContent(htmlContent: string, subfolder?: string): string {
  if (!htmlContent) return htmlContent;

  try {
    // Regular expression to find image tags with src attribute
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
    
    // Replace each match with updated GCS URL
    return htmlContent.replace(imgRegex, (match, capturedUrl) => {
      const gcsUrl = convertToGcsUrl(capturedUrl, subfolder);
      return match.replace(capturedUrl, gcsUrl);
    });
  } catch (error) {
    console.error('Error processing HTML content:', error);
    return htmlContent; // Return original content in case of error
  }
} 