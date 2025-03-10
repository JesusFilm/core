import Stack from '@mui/material/Stack'
import Box from '@mui/system/Box'
import MuxPlayer from '@mux/mux-player-react'
import { ReactElement } from 'react'

import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'

export function MuxDetails({
  open,
  activeVideoBlock
}: Pick<
  VideoDetailsProps,
  'open' | 'activeVideoBlock' | 'onSelect'
>): ReactElement {
  return (
    <Stack spacing={4} sx={{ p: 6 }} data-testid="MuxDetails">
      <Box
        sx={{
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {open &&
          activeVideoBlock?.mediaVideo?.__typename === 'MuxVideo' &&
          activeVideoBlock?.mediaVideo?.playbackId != null && (
            <MuxPlayer
              streamType="on-demand"
              playbackId={activeVideoBlock.mediaVideo.playbackId}
              metadata={{
                video_id: activeVideoBlock.mediaVideo.id || '',
                video_title: activeVideoBlock.title || '',
                player_name: 'journeys-admin'
              }}
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '16/9'
              }}
              poster={`https://image.mux.com/${activeVideoBlock.mediaVideo.playbackId}/thumbnail.png?time=1`}
            />
          )}
      </Box>
    </Stack>
  )
}
