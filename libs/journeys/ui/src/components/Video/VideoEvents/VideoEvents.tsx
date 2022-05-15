import { ReactElement, useEffect } from 'react'
import videojs from 'video.js'

interface VideoEventsProps {
  player: videojs.Player
  blockId: string
}

export function VideoEvents({
  player,
  blockId
}: VideoEventsProps): ReactElement {
  useEffect(() => {
    player.on('player', () => {
      console.log('PLAY')
    })

    player.on('pause', () => {
      console.log('PAUSE')
    })

    player.on('ended', () => {
      console.log('ENDED')
    })
  })
  return <></>
}
