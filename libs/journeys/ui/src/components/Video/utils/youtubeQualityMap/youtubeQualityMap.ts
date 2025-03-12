import { TFunction } from 'next-i18next'

/**
 * Returns a mapping of YouTube quality codes to human-readable quality labels
 * @param t Translation function
 * @returns Record mapping YouTube quality codes to quality labels
 */
export function getYoutubeQualityMap(t: TFunction): Record<string, string> {
  return {
    tiny: t('144p'),
    small: t('240p'),
    medium: t('360p'),
    large: t('480p'),
    hd720: t('720p'),
    hd1080: t('1080p'),
    hd1440: t('1440p'),
    hd2160: t('2160p (4K)'),
    highres: t('4K+'),
    auto: t('Auto'),
    default: '-'
  }
}
