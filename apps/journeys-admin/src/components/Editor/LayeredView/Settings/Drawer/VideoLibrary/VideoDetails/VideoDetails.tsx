import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
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
import { DRAWER_WIDTH } from '../../../../../constants'
import { DrawerTitle } from '../../Drawer'
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
    <>
      {open && (
        <Stack
          component={Paper}
          elevation={0}
          sx={{
            position: 'fixed',
            top: 0,
            right: 16,
            bottom: 0,
            width: DRAWER_WIDTH,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
          border={1}
          borderColor="divider"
          data-testid="SettingsDrawer"
        >
          <DrawerTitle
            title={t('Video Details')}
            onClose={() => {
              onClose(true)
            }}
          />
          <Stack
            data-testid="SettingsDrawerContent"
            className="swiper-no-swiping"
            flexGrow={1}
            sx={{ overflow: 'auto', mb: { md: 4 } }}
          >
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
                {/* render conditional to unmount details content if not open */}
                {open && (
                  <Details
                    data-testid="DetailsContent"
                    key={activeVideoBlock?.videoId}
                    id={id}
                    open={open}
                    onSelect={handleSelect}
                    activeVideoBlock={activeVideoBlock}
                  />
                )}
              </Box>
            </Stack>
          </Stack>
        </Stack>
      )}
    </>
  )
}

export default VideoDetails
