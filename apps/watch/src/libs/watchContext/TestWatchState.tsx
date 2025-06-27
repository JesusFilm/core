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
      <div>currentSubtitleOn: {state.currentSubtitleOn?.toString()}</div>
      <div>player.play: {state.player.play.toString()}</div>
      <div>player.active: {state.player.active.toString()}</div>
      <div>player.currentTime: {state.player.currentTime}</div>
      <div>player.progress: {state.player.progress}</div>
      <div>
        player.progressPercentNotYetEmitted:{' '}
        {state.player.progressPercentNotYetEmitted.join(',')}
      </div>
      <div>player.volume: {state.player.volume}</div>
      <div>player.mute: {state.player.mute.toString()}</div>
      <div>player.fullscreen: {state.player.fullscreen.toString()}</div>
      <div>
        player.openSubtitleDialog: {state.player.openSubtitleDialog.toString()}
      </div>
      <div>
        player.loadSubtitleDialog: {state.player.loadSubtitleDialog.toString()}
      </div>
      <div>player.loading: {state.player.loading.toString()}</div>
      <div>player.durationSeconds: {state.player.durationSeconds}</div>
      <div>player.duration: {state.player.duration}</div>
    </>
  )
}
