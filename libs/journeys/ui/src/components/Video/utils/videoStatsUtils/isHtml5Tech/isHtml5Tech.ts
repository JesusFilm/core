import { Html5 } from '../../../utils/videoJsTypes/Html5'
import { YoutubeTech } from '../../../utils/videoJsTypes/YoutubeTech'

/**
 * Type guard to check if a tech is HTML5 tech
 * @param tech The tech to check
 * @returns True if the tech is HTML5 tech
 */
export function isHtml5Tech(tech: Html5 | YoutubeTech): tech is Html5 {
  return tech != null && 'vhs' in tech
}
