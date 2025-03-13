import { Html5 } from '../../../utils/videoJsTypes/Html5'
import { YoutubeTech } from '../../../utils/videoJsTypes/YoutubeTech'

/**
 * Type guard to check if a tech is YouTube tech
 * @param tech The tech to check
 * @returns True if the tech is YouTube tech
 */
export function isYoutubeTech(tech: Html5 | YoutubeTech): tech is YoutubeTech {
  return tech != null && 'ytPlayer' in tech
}
