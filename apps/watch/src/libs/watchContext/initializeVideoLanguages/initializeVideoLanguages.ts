import { Dispatch } from 'react'

import { AudioLanguageData, WatchAction } from '../WatchContext'

/**
 * Initializes video language preferences by setting available audio and subtitle languages
 *
 * This function dispatches the necessary actions to:
 * 1. Set available audio languages and automatically select the best matching audio language
 * 2. Set available subtitle languages and determine if subtitles should be auto-enabled
 *
 * @param dispatch - The dispatch function from the watch context
 * @param videoAudioLanguagesIdsAndSlugs - Available audio languages for the current video id and slug only
 * @param videoSubtitleLanguageIds - Available subtitle language IDs for the current video
 */
export function initializeVideoLanguages(
  dispatch: Dispatch<WatchAction>,
  videoAudioLanguagesIdsAndSlugs: AudioLanguageData[],
  videoSubtitleLanguageIds: string[]
): void {
  // Set video audio languages first (needed for auto subtitle calculation)
  dispatch({
    type: 'SetVideoAudioLanguages',
    videoAudioLanguagesIdsAndSlugs: videoAudioLanguagesIdsAndSlugs ?? []
  })

  // Set video subtitle languages and calculate auto-subtitle preference
  dispatch({
    type: 'SetVideoSubtitleLanguages',
    videoSubtitleLanguageIds: videoSubtitleLanguageIds ?? []
  })
}
