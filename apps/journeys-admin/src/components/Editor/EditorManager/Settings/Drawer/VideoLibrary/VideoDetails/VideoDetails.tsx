import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { BlockDeleteForCoverImage } from '../../../../../../../../__generated__/BlockDeleteForCoverImage'
import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/BlockFields'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../__generated__/globalTypes'
import { Drawer } from '../../Drawer'
import { LocalDetails } from '../VideoFromLocal/LocalDetails'
import { MuxDetails } from '../VideoFromMux/MuxDetails'
import { YouTubeDetails } from '../VideoFromYouTube/YouTubeDetails'

export interface VideoDetailsProps {
  open: boolean
  id: string
  onClose: (closeParent?: boolean) => void
  onSelect: (block: VideoBlockUpdateInput) => void
  source: VideoBlockSource
  activeVideoBlock?: TreeBlock<VideoBlock>
}

export const BLOCK_DELETE_FOR_COVER_IMAGE = gql`
  mutation BlockDeleteForCoverImage(
    $blockDeleteId: ID!
    $journeyId: ID!
    $parentBlockId: ID
  ) {
    blockDelete(
      id: $blockDeleteId
      journeyId: $journeyId
      parentBlockId: $parentBlockId
    ) {
      id
      parentOrder
    }
  }
`

export function VideoDetails({
  open,
  id,
  onClose,
  onSelect,
  source,
  activeVideoBlock
}: VideoDetailsProps): ReactElement {
  const [blockDeleteForCoverImage] = useMutation<BlockDeleteForCoverImage>(
    BLOCK_DELETE_FOR_COVER_IMAGE
  )
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')

  let Details: (
    props: Pick<
      VideoDetailsProps,
      'id' | 'open' | 'onSelect' | 'activeVideoBlock'
    >
  ) => ReactElement

  switch (source) {
    case VideoBlockSource.internal:
      Details = LocalDetails
      break
    case VideoBlockSource.mux:
      Details = MuxDetails
      break
    case VideoBlockSource.youTube:
      Details = YouTubeDetails
      break
    default:
      Details = LocalDetails
      break
  }

  const handleSelect = (block: VideoBlockUpdateInput): void => {
    onSelect(block)
  }

  const handleClearVideo = async (): Promise<void> => {
    if (
      activeVideoBlock?.id != null &&
      activeVideoBlock?.posterBlockId != null
    ) {
      await blockDeleteForCoverImage({
        variables: {
          blockDeleteId: activeVideoBlock.posterBlockId,
          journeyId: journey?.id,
          parentBlockId: activeVideoBlock.id
        }
      })
    }
    onSelect({
      videoId: null,
      videoVariantLanguageId: null,
      posterBlockId: null,
      source: VideoBlockSource.internal
    })
  }

  return (
    <Drawer title={t('Video Details')} open={open} onClose={onClose}>
      <Stack sx={{ display: 'flex', justifyContent: 'center' }}>
        {activeVideoBlock != null && (
          <Stack
            direction="row"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              px: 6,
              pt: 4
            }}
          >
            <Button
              startIcon={<Grid1Icon />}
              size="small"
              onClick={() => onClose(false)}
            >
              {t('Change Video')}
            </Button>
            <IconButton
              onClick={handleClearVideo}
              size="small"
              aria-label="clear-video"
            >
              <Trash2Icon />
            </IconButton>
          </Stack>
        )}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            mt: activeVideoBlock != null ? -6 : 0
          }}
        >
          <Details
            id={id}
            open={open}
            onSelect={handleSelect}
            activeVideoBlock={activeVideoBlock}
          />
        </Box>
      </Stack>
    </Drawer>
  )
}

export default VideoDetails
