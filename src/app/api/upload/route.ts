import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  // Check for required environment variables
  if (!process.env.GCS_CREDENTIALS || !process.env.GCS_BUCKET_NAME) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Parse GCS credentials
  let credentials;
  try {
    credentials = JSON.parse(process.env.GCS_CREDENTIALS);
  } catch (error) {
    console.error('Invalid GCS_CREDENTIALS:', error);
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Initialize GCS storage
  const storage = new Storage({ credentials });
  const bucketName = process.env.GCS_BUCKET_NAME;
  const bucket = storage.bucket(bucketName);

  // Parse form data from the request
  const formData = await request.formData();
  const file = formData.get('file');
  
  // Get subfolder parameter (default to "original" if not specified)
  const subfolder = formData.get('subfolder') || 'original';

  // Validate that a file was uploaded and is of type File
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Generate a unique file name with the original extension
  const originalName = file.name;
  const extension = originalName.split('.').pop();
  const uniqueName = `${uuidv4()}.${extension}`;

  try {
    // Convert file to buffer and upload to GCS
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = `${subfolder}/${uniqueName}`;
    
    await bucket.file(filePath).save(fileBuffer, {
      contentType: file.type,
      predefinedAcl: 'publicRead',
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    // For compatibility with our image conversion utilities, return both the full URL and just the filename
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    
    return NextResponse.json({ 
      url: publicUrl,
      filename: uniqueName,
      // Include additional info for reference
      path: filePath,
      bucket: bucket.name,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}