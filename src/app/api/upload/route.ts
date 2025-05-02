import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  // Check for required environment variables
  if (!process.env.GCS_CREDENTIALS || !process.env.GCS_BUCKET_NAME) {
    console.error('Missing environment variables:', {
      hasCredentials: !!process.env.GCS_CREDENTIALS,
      hasBucketName: !!process.env.GCS_BUCKET_NAME
    });
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  console.log('Config check: All required environment variables exist');
  console.log('Using bucket:', process.env.GCS_BUCKET_NAME);

  // Parse GCS credentials - with better error handling
  let credentials;
  try {
    // Try to parse directly
    const rawCredentials = process.env.GCS_CREDENTIALS;
    
    // Handle various formats - quotes might be included in the env var
    const cleanedCredentials = rawCredentials
      .replace(/^['"]/, '') // Remove starting quote if present
      .replace(/['"]$/, ''); // Remove ending quote if present
    
    console.log('Attempting to parse credentials');
    credentials = JSON.parse(cleanedCredentials);
    
    // Validate required credential fields
    if (!credentials.client_email || !credentials.private_key || !credentials.project_id) {
      throw new Error('Missing required credential fields');
    }
    console.log('Credentials parsed successfully, project ID:', credentials.project_id);
  } catch (error) {
    console.error('Invalid GCS_CREDENTIALS:', error);
    console.error('First few characters of credentials string:', process.env.GCS_CREDENTIALS?.substring(0, 20) + '...');
    return NextResponse.json({ 
      error: 'Server configuration error - invalid credentials',
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }

  // Initialize GCS storage
  const storage = new Storage({ credentials });
  const bucketName = process.env.GCS_BUCKET_NAME;
  const bucket = storage.bucket(bucketName);
  console.log('GCS storage initialized with bucket:', bucketName);

  // Parse form data from the request
  const formData = await request.formData();
  const file = formData.get('file');
  
  // Get subfolder parameter (default to "original" if not specified)
  const subfolder = formData.get('subfolder') || 'original';
  
  // Check if a specific filename was provided (for maintaining consistency across uploads)
  const providedFilename = formData.get('filename')?.toString();

  // Validate that a file was uploaded and is of type File
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);
  console.log('Using subfolder:', subfolder);
  console.log('Provided filename:', providedFilename || 'None');

  // Generate a unique file name with the original extension
  const originalName = file.name;
  const fileType = file.type;
  
  console.log('Original filename:', originalName);
  console.log('File MIME type:', fileType);
  
  // Get extension from original file or derive from MIME type
  let extension = originalName.split('.').pop()?.toLowerCase();
  
  // If no extension or it's blob, derive from mime type
  if (!extension || extension === 'blob') {
    // Map common image MIME types to extensions
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff'
    };
    
    extension = mimeToExt[fileType] || 'jpg'; // Default to jpg if unknown
    console.log(`Using extension .${extension} derived from MIME type`);
  }

  // Use provided filename if available, otherwise generate a uuid
  const uniqueName = providedFilename || `${uuidv4()}.${extension}`;
  console.log('Using filename:', uniqueName);

  try {
    // Convert file to buffer and upload to GCS
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = `${subfolder}/${uniqueName}`;
    
    console.log('Attempting upload to path:', filePath);
    console.log('Bucket name:', bucket.name);
    
    await bucket.file(filePath).save(fileBuffer, {
      contentType: file.type,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    // For compatibility with our image conversion utilities, return both the full URL and just the filename
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    console.log('Upload successful, public URL:', publicUrl);
    
    return NextResponse.json({ 
      url: publicUrl,
      filename: uniqueName,
      // Include additional info for reference
      path: filePath,
      bucket: bucket.name,
    });
  } catch (error) {
    console.error('Upload failed - detailed error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
}