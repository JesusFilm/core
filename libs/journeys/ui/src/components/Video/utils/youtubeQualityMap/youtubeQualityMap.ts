/**
 * Returns a mapping of YouTube quality codes to human-readable quality labels
 * @returns Record mapping YouTube quality codes to quality labels
 */
export function getYoutubeQualityMap(): Record<string, string> {
  return {
    tiny: '144p',
    small: '240p',
    medium: '360p',
    large: '480p',
    hd720: '720p',
    hd1080: '1080p',
    hd1440: '1440p',
    hd2160: '2160p (4K)',
    highres: '4K+',
    auto: 'Auto',
    default: '-'
  }
}
