import { Dispatch } from 'react'

import { GetSubtitles_video_variant_subtitle as SubtitleLanguage } from '../../../../__generated__/GetSubtitles'
import { GetVariantLanguagesIdAndSlug_video_variantLanguages as VariantLanguageIdAndSlug } from '../../../../__generated__/GetVariantLanguagesIdAndSlug'
import { WatchAction } from '../WatchContext'

/**
 * Initializes video language preferences by setting available audio and subtitle languages
 *
 * This function dispatches the necessary actions to:
 * 1. Set available audio languages and automatically select the best matching audio language
 * 2. Set available subtitle languages and determine if subtitles should be auto-enabled
 *
 * @param dispatch - The dispatch function from the watch context
 * @param videoAudioLanguagesIdsAndSlugs - Available audio languages for the current video (simplified structure with id and slug only)
 * @param videoSubtitleLanguages - Available subtitle languages for the current video
 */
export function initializeVideoLanguages(
  dispatch: Dispatch<WatchAction>,
  videoAudioLanguagesIdsAndSlugs: VariantLanguageIdAndSlug[],
  videoSubtitleLanguages: SubtitleLanguage[]
): void {
  // Set video audio languages first (needed for auto subtitle calculation)
  dispatch({
    type: 'SetVideoAudioLanguages',
    videoAudioLanguagesIdsAndSlugs: videoAudioLanguagesIdsAndSlugs ?? []
  })

  // Set video subtitle languages and calculate auto-subtitle preference
  dispatch({
    type: 'SetVideoSubtitleLanguages',
    videoSubtitleLanguages: videoSubtitleLanguages ?? []
  })
}
