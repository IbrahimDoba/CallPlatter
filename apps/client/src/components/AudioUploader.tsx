// import { useState, useRef, useEffect } from 'react';
// import { UploadButton } from '@/app/api/uploadthing/core';
// import { Play, Pause } from 'lucide-react';

// type FileWithUrl = {
//   url: string;
//   name: string;
//   size: number;
// };

// interface AudioUploaderProps {
//   onUploadComplete: (url: string) => void;
//   initialAudioUrl?: string;
//   callId: string;
// }

// export const AudioUploader = ({ onUploadComplete, initialAudioUrl = '', callId }: AudioUploaderProps) => {
//   const [isUploading, setIsUploading] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // Initialize audio element
//   useEffect(() => {
//     if (!initialAudioUrl) return;
    
//     const audio = new Audio(initialAudioUrl);
//     audioRef.current = audio;

//     const updateTime = () => setCurrentTime(audio.currentTime);
//     const updateDuration = () => setDuration(audio.duration);
//     const handleEnded = () => setIsPlaying(false);

//     audio.addEventListener('timeupdate', updateTime);
//     audio.addEventListener('durationchange', updateDuration);
//     audio.addEventListener('ended', handleEnded);

//     return () => {
//       audio.pause();
//       audio.removeEventListener('timeupdate', updateTime);
//       audio.removeEventListener('durationchange', updateDuration);
//       audio.removeEventListener('ended', handleEnded);
//       audio.src = '';
//     };
//   }, [initialAudioUrl]);

//   const togglePlayPause = () => {
//     if (!audioRef.current) return;
    
//     if (isPlaying) {
//       audioRef.current.pause();
//     } else {
//       audioRef.current.play().catch(error => {
//         console.error('Error playing audio:', error);
//       });
//     }
//     setIsPlaying(!isPlaying);
//   };

//   const formatTime = (time: number) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   };

//   const generateWaveBars = (count = 30) => {
//     return Array.from({ length: count }).map((_, i) => {
//       const height = Math.random() * 60 + 10; // Random height between 10 and 70
//       return (
//         <div
//           key={i}
//           className="w-1 bg-blue-400 rounded-full transition-all duration-300"
//           style={{ height: `${height}%` }}
//         />
//       );
//     });
//   };

//   return (
//     <div className="space-y-4">
//       {initialAudioUrl ? (
//         <div className="space-y-3">
//           <div className="flex items-center gap-3 bg-muted p-4 rounded-lg">
//             <button
//               type="button"
//               onClick={togglePlayPause}
//               className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
//               disabled={!initialAudioUrl}
//             >
//               {isPlaying ? (
//                 <Pause className="h-5 w-5 text-blue-600" />
//               ) : (
//                 <Play className="h-5 w-5 text-blue-600 ml-0.5" />
//               )}
//             </button>

//             <div className="flex-1">
//               <div className="flex justify-between text-xs text-muted-foreground mb-1">
//                 <span>{formatTime(currentTime)}</span>
//                 <span>{formatTime(duration || 0)}</span>
//               </div>
//               <div className="flex items-center h-8 gap-1">
//                 {generateWaveBars()}
//               </div>
//             </div>

//             <a
//               href={initialAudioUrl}
//               download={`call-recording-${callId}.mp3`}
//               className="text-sm text-blue-600 hover:underline whitespace-nowrap ml-2"
//               onClick={(e) => e.stopPropagation()}
//             >
//               Download
//             </a>
//           </div>
          
//           <button
//             type="button"
//             onClick={() => onUploadComplete('')}
//             className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
//             disabled={isUploading}
//           >
//             Remove Recording
//           </button>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//             <UploadButton
//               endpoint="audioUploader"
//               onClientUploadComplete={(res: FileWithUrl[]) => {
//                 if (res?.[0]?.url) {
//                   onUploadComplete(res[0].url);
//                 }
//                 setIsUploading(false);
//               }}
//               onUploadBegin={() => setIsUploading(true)}
//               onUploadError={(error: Error) => {
//                 console.error('Error:', error);
//                 setIsUploading(false);
//               }}
//             >
//               {({ onClick }) => (
//                 <div className="space-y-2">
//                   <p className="text-sm text-muted-foreground">
//                     {isUploading ? 'Uploading...' : 'Click to upload a call recording'}
//                   </p>
//                   {!isUploading && (
//                     <button
//                       type="button"
//                       onClick={onClick}
//                       className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                     >
//                       Select File
//                     </button>
//                   )}
//                 </div>
//               )}
//             </UploadButton>
//           </div>
//           {isUploading && (
//             <div className="flex items-center justify-center">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
