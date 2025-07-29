// Mock Video Data for WAT-135 Shaping

import { Video, VideoCollection } from '../types/homepage.types';
import { COLLECTIONS } from './collections';

// Mock videos with realistic data
const MOCK_VIDEOS: Video[] = [
  {
    id: 'jesus-film-001',
    title: 'JESUS Film',
    description: 'The life of Jesus Christ according to the Gospel of Luke',
    thumbnailUrl: '/images/jesus-film-thumb.jpg',
    duration: 7200, // 2 hours
    category: 'Featured',
    language: 'en',
    publishedAt: '2024-01-15',
    watchUrl: '/watch/jesus-film-001'
  },
  {
    id: 'easter-story-002',
    title: 'The True Meaning of Easter',
    description: 'Discover the power behind the resurrection story',
    thumbnailUrl: '/images/easter-story-thumb.jpg',
    duration: 1800, // 30 minutes
    category: 'Featured',
    language: 'en',
    publishedAt: '2024-03-20',
    watchUrl: '/watch/easter-story-002'
  },
  {
    id: 'my-last-day-003',
    title: 'My Last Day',
    description: 'Last hour of Jesus\' life from criminal\'s point of view',
    thumbnailUrl: '/images/my-last-day-thumb.jpg',
    duration: 540, // 9 minutes
    category: 'Short Videos',
    language: 'en',
    publishedAt: '2024-02-10',
    watchUrl: '/watch/my-last-day-003'
  },
  {
    id: 'gospel-luke-004',
    title: 'Gospel of Luke',
    description: 'Complete Gospel of Luke visual narrative',
    thumbnailUrl: '/images/luke-gospel-thumb.jpg',
    duration: 10800, // 3 hours
    category: 'Video Gospel',
    language: 'en',
    publishedAt: '2024-01-01',
    watchUrl: '/watch/gospel-luke-004'
  },
  {
    id: 'book-hope-005',
    title: 'The Book of Hope',
    description: 'Animated journey through God\'s story of redemption',
    thumbnailUrl: '/images/book-hope-thumb.jpg',
    duration: 1980, // 33 minutes
    category: 'Animated Series',
    language: 'en',
    publishedAt: '2024-02-28',
    watchUrl: '/watch/book-hope-005'
  },
  {
    id: 'easter-2025-006',
    title: 'Easter 2025 Celebration',
    description: 'Join our global Easter celebration event',
    thumbnailUrl: '/images/easter-2025-thumb.jpg',
    duration: 3600, // 1 hour
    category: 'Upcoming Events',
    language: 'en',
    publishedAt: '2025-04-20',
    watchUrl: '/watch/easter-2025-006'
  }
];

// Group videos by collection
export const MOCK_COLLECTIONS: VideoCollection[] = [
  {
    id: COLLECTIONS.featured,
    title: 'Featured Content',
    description: 'Our most impactful and popular videos',
    category: 'featured',
    videos: MOCK_VIDEOS.filter(v => v.category === 'Featured')
  },
  {
    id: COLLECTIONS.new,
    title: 'New Releases',
    description: 'Latest videos and recently added content',
    category: 'new',
    videos: MOCK_VIDEOS.slice(0, 3) // Most recent
  },
  {
    id: COLLECTIONS.videoGospel,
    title: 'Video Gospel',
    description: 'Complete Gospel narratives in visual form',
    category: 'videoGospel',
    videos: MOCK_VIDEOS.filter(v => v.category === 'Video Gospel')
  },
  {
    id: COLLECTIONS.shortVideos,
    title: 'Short Videos',
    description: 'Powerful messages in bite-sized format',
    category: 'shortVideos',
    videos: MOCK_VIDEOS.filter(v => v.category === 'Short Videos')
  },
  {
    id: COLLECTIONS.animatedSeries,
    title: 'Animated Series',
    description: 'Engaging animated biblical content',
    category: 'animatedSeries',
    videos: MOCK_VIDEOS.filter(v => v.category === 'Animated Series')
  },
  {
    id: COLLECTIONS.upcomingEvents,
    title: 'Upcoming Events',
    description: 'Live events and special celebrations',
    category: 'upcomingEvents',
    videos: MOCK_VIDEOS.filter(v => v.category === 'Upcoming Events')
  }
];

export { MOCK_VIDEOS }; 