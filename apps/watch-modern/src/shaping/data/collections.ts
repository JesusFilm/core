// Hardcoded Collections for WAT-135 Shaping

import type { TrendingCategory, LanguageOption } from '../types/homepage.types';

export const COLLECTIONS = {
  featured: 'col_featured_001',
  new: 'col_new_002', 
  videoGospel: 'col_gospel_003',
  shortVideos: 'col_short_004',
  animatedSeries: 'col_animated_005',
  upcomingEvents: 'col_events_006'
} as const;

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' }
];

export const TRENDING_CATEGORIES: Record<TrendingCategory, string> = {
  featured: 'Featured Content',
  new: 'New Releases', 
  videoGospel: 'Video Gospel',
  shortVideos: 'Short Videos',
  animatedSeries: 'Animated Series',
  upcomingEvents: 'Upcoming Events',
  lumoMark: 'LUMO - Mark'
};

export const HERO_CONTENT = {
  en: {
    title: 'Discover Life-Changing Stories',
    subtitle: 'Watch powerful biblical content that transforms hearts and minds across cultures and languages.',
    ctaText: 'Start Watching'
  },
  ru: {
    title: 'Откройте для себя истории, меняющие жизнь',
    subtitle: 'Смотрите мощный библейский контент, который преображает сердца и умы в разных культурах и языках.',
    ctaText: 'Начать просмотр'
  },
  fr: {
    title: 'Découvrez des histoires qui changent la vie',
    subtitle: 'Regardez du contenu biblique puissant qui transforme les cœurs et les esprits à travers les cultures et les langues.',
    ctaText: 'Commencer à regarder'
  }
}; 