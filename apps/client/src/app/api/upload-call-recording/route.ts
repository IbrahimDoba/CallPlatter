import { UTApi } from 'uploadthing/server';
import { NextRequest, NextResponse } from 'next/server';

// Initialize UTApi with environment variables
const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const audioFile = formData.get('audio') as File;
    const duration = formData.get('duration') as string;
    const callId = formData.get('callId') as string;
    const timestamp = formData.get('timestamp') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be audio file.' },
        { status: 400 }
      );
    }

    // Check file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    console.log(`📁 Uploading recording: ${audioFile.name} (${Math.round(audioFile.size / 1024)}KB)`);

    // Convert File to Blob
    const blob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });
    
    // Upload to UploadThing
    const uploadResponse = await utapi.uploadFiles(
      new File([blob], audioFile.name, { type: audioFile.type })
    );

    if (!uploadResponse || !uploadResponse.data) {
      throw new Error('UploadThing upload failed');
    }

    const uploadedFile = uploadResponse.data;
    
    console.log(`✅ Recording uploaded successfully: ${uploadedFile.ufsUrl}`);

    // Return the URL and metadata
    return NextResponse.json({
      url: uploadedFile.ufsUrl,
      size: uploadedFile.size,
      name: uploadedFile.name,
      key: uploadedFile.key,
      duration: Number.parseInt(duration) || 0,
      callId,
      timestamp,
    });

  } catch (error) {
    console.error('❌ Recording upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload recording',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Handle file cleanup/deletion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get('key');
    
    if (!fileKey) {
      return NextResponse.json(
        { error: 'No file key provided' },
        { status: 400 }
      );
    }

    // Delete from UploadThing
    await utapi.deleteFiles(fileKey);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Recording deletion error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete recording',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}