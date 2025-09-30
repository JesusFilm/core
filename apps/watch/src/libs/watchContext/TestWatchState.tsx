/* eslint-disable i18next/no-literal-string */
import { ReactElement } from 'react'

import { useWatch } from './WatchContext'

// This is only used for testing purpose
// We don't need to translate the given text below

export function TestWatchState(): ReactElement {
  const { state } = useWatch()
  return (
    <>
      <div>audioLanguageId: {state.audioLanguageId}</div>
      <div>subtitleLanguageId: {state.subtitleLanguageId}</div>
      <div>subtitleOn: {state.subtitleOn?.toString()}</div>
      <div>
        videoAudioLanguageIds: {state.videoAudioLanguageIds?.length || 0}
      </div>
      <div>
        videoSubtitleLanguageIds: {state.videoSubtitleLanguageIds?.length || 0}
      </div>
    </>
  )
}
