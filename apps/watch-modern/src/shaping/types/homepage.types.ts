// Homepage Types for WAT-135 Shaping

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  category: string;
  language: Language;
  publishedAt: string;
  watchUrl: string;
}

export interface VideoCollection {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  category: TrendingCategory;
}

export type Language = 'en' | 'ru' | 'fr';

export type TrendingCategory = 
  | 'featured' 
  | 'new' 
  | 'videoGospel' 
  | 'shortVideos' 
  | 'animatedSeries' 
  | 'upcomingEvents'
  | 'lumoMark';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

export interface SectionLoadingState {
  isLoading: boolean;
  error?: string;
}

export interface HomepageData {
  hero: {
    title: string;
    subtitle: string;
    videoUrl?: string;
    ctaText: string;
  };
  collections: VideoCollection[];
  languages: LanguageOption[];
} 