import { useState } from 'react';
import { UploadButton } from '@/app/api/uploadthing/core';

type FileWithUrl = {
  url: string;
  name: string;
  size: number;
};

interface AudioUploaderProps {
  onUploadComplete: (url: string) => void;
  initialAudioUrl?: string;
  callId: string;
}

export const AudioUploader = ({ onUploadComplete, initialAudioUrl = '' }: AudioUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {initialAudioUrl ? (
          <div className="space-y-2">
            <audio
              src={initialAudioUrl}
              controls
              className="w-full"
            >
              <track kind="captions" />
            </audio>
            <button
              type="button"
              onClick={() => onUploadComplete('')}
              className="text-sm text-red-600 hover:text-red-800"
              disabled={isUploading}
            >
              Remove Audio
            </button>
          </div>
        ) : (
          <UploadButton
            endpoint="audioUploader"
            onClientUploadComplete={(res: FileWithUrl[]) => {
              if (res?.[0]?.url) {
                onUploadComplete(res[0].url);
              }
              setIsUploading(false);
            }}
            onUploadBegin={() => setIsUploading(true)}
            onUploadError={(error: Error) => {
              console.error('Error uploading file:', error);
              alert('Error uploading file');
              setIsUploading(false);
            }}
          />
        )}
      </div>
      {isUploading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
        </div>
      )}
    </div>
  );
}
