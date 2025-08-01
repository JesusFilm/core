'use client'

import type { Video } from '../../types/homepage.types';

interface VideoCardProps {
  video: Video;
  className?: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export default function VideoCard({ video, className = '' }: VideoCardProps) {
  return (
    <div className={`group cursor-pointer transition-transform hover:scale-105 ${className}`}>
      {/* Video Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-800">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
          onError={(e) => {
            // Fallback to appropriate placeholder based on video category
            const target = e.target as HTMLImageElement;
            if (video.category === 'LUMO - Mark') {
              target.src = 'https://d1wl257kev7hsz.cloudfront.net/cinematics/GOMarkCollection.mobileCinematicHigh.jpg';
            } else {
              target.src = 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F1_jf-0-0.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75';
            }
          }}
        />
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-3 shadow-lg">
            <svg className="h-6 w-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Video Info */}
      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-[#ee3441]">
          {video.title}
        </h3>
        <p className="line-clamp-2 text-xs text-stone-200/80">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-xs text-stone-200/60">
          <span className="capitalize">{video.category}</span>
          <span>{video.publishedAt.split('-')[0]}</span>
        </div>
      </div>
    </div>
  );
} 