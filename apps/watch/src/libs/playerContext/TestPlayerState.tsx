/* eslint-disable i18next/no-literal-string */
// This is only used for testing purpose
// We don't need to translate the given text below
import { ReactElement } from 'react'

import { usePlayer } from '.'

export function TestPlayerState(): ReactElement {
  const { state } = usePlayer()

  return (
    <>
      <div>player.play: {state.play.toString()}</div>
      <div>player.active: {state.active.toString()}</div>
      <div>player.currentTime: {state.currentTime}</div>
      <div>player.progress: {state.progress}</div>
      <div>
        player.progressPercentNotYetEmitted:{' '}
        {state.progressPercentNotYetEmitted.join(',')}
      </div>
      <div>player.volume: {state.volume}</div>
      <div>player.mute: {state.mute.toString()}</div>
      <div>player.fullscreen: {state.fullscreen.toString()}</div>
      <div>
        player.openSubtitleDialog: {state.openSubtitleDialog.toString()}
      </div>
      <div>
        player.loadSubtitleDialog: {state.loadSubtitleDialog.toString()}
      </div>
      <div>player.loading: {state.loading.toString()}</div>
      <div>player.durationSeconds: {state.durationSeconds}</div>
      <div>player.duration: {state.duration}</div>
    </>
  )
}
