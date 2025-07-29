'use client'

import { Video } from '../../types/homepage.types';

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
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAuNSA5MEwxNjAgNzVWMTA1TDEzMC41IDkwWiIgZmlsbD0iIzk0QTNBRiIvPgo8L3N2Zz4K';
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
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600">
          {video.title}
        </h3>
        <p className="line-clamp-2 text-xs text-gray-600">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{video.category}</span>
          <span>{new Date(video.publishedAt).getFullYear()}</span>
        </div>
      </div>
    </div>
  );
} 