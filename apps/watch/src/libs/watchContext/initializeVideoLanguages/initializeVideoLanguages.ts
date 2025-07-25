import { Dispatch } from 'react'

import { GetLanguagesSlug_video_variantLanguagesWithSlug as AudioLanguage } from '../../../../__generated__/GetLanguagesSlug'
import { GetSubtitles_video_variant_subtitle as SubtitleLanguage } from '../../../../__generated__/GetSubtitles'
import { WatchAction } from '../WatchContext'

/**
 * Initializes video language preferences by setting available audio and subtitle languages
 *
 * This function dispatches the necessary actions to:
 * 1. Set available audio languages and automatically select the best matching audio language
 * 2. Set available subtitle languages and determine if subtitles should be auto-enabled
 *
 * @param dispatch - The dispatch function from the watch context
 * @param videoAudioLanguages - Available audio languages for the current video
 * @param videoSubtitleLanguages - Available subtitle languages for the current video
 */
export function initializeVideoLanguages(
  dispatch: Dispatch<WatchAction>,
  videoAudioLanguages: AudioLanguage[],
  videoSubtitleLanguages: SubtitleLanguage[]
): void {
  // Set video audio languages first (needed for auto subtitle calculation)
  dispatch({
    type: 'SetVideoAudioLanguages',
    videoAudioLanguages: videoAudioLanguages ?? []
  })

  // Set video subtitle languages and calculate auto-subtitle preference
  dispatch({
    type: 'SetVideoSubtitleLanguages',
    videoSubtitleLanguages: videoSubtitleLanguages ?? []
  })
}
