import type { Video } from '../types'

const now = new Date()

export const mockVideos: Video[] = [
  {
    slug: 'city-runner',
    title: 'City Runner B-Roll',
    description: 'Steadicam tracking shot of a runner weaving through city streets at sunrise.',
    duration: 92,
    width: 1920,
    height: 1080,
    fps: 29.97,
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
    poster: 'https://picsum.photos/800/450?random=1',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    tags: ['sports', 'urban', 'sunrise']
  },
  {
    slug: 'concert-crowd',
    title: 'Concert Crowd Energy',
    description: 'Wide crowd shot from a music festival with sweeping camera movement.',
    duration: 115,
    width: 3840,
    height: 2160,
    fps: 59.94,
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
    poster: 'https://picsum.photos/800/450?random=2',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    tags: ['music', 'festival', 'crowd']
  },
  {
    slug: 'nature-panorama',
    title: 'Mountain Panorama Flyover',
    description: 'Drone shot over mountain range transitioning from valley floor to peak ridge.',
    duration: 140,
    width: 4096,
    height: 2160,
    fps: 23.98,
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
    poster: 'https://picsum.photos/800/450?random=3',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    tags: ['nature', 'drone', 'landscape']
  }
]

export function findVideo(slug: string): Video | undefined {
  return mockVideos.find((video) => video.slug === slug)
}
