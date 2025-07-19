/* eslint-disable i18next/no-literal-string */
import { ReactElement } from 'react'

import { useWatch } from './WatchContext'

// This is only used for testing purpose
// We don't need to translate the given text below

export function TestWatchState(): ReactElement {
  const { state } = useWatch()
  return (
    <>
      <div>siteLanguage: {state.siteLanguage}</div>
      <div>audioLanguage: {state.audioLanguage}</div>
      <div>subtitleLanguage: {state.subtitleLanguage}</div>
      <div>subtitleOn: {state.subtitleOn.toString()}</div>
      <div>loading: {state.loading?.toString()}</div>
      <div>videoId: {state.videoId || 'none'}</div>
      <div>videoVariantSlug: {state.videoVariantSlug || 'none'}</div>
      <div>allLanguages: {state.allLanguages?.length || 0} languages</div>
      <div>
        videoAudioLanguages: {state.videoAudioLanguages?.length || 0} audio
        languages
      </div>
      <div>
        videoSubtitleLanguages: {state.videoSubtitleLanguages?.length || 0}{' '}
        subtitle languages
      </div>
      <div>
        currentAudioLanguage:{' '}
        {state.currentAudioLanguage?.language?.id || 'none'}
      </div>
      <div>autoSubtitle: {state.autoSubtitle?.toString()}</div>
    </>
  )
}
