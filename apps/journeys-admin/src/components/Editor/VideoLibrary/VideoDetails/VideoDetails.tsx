import { gql, useMutation } from '@apollo/client'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Trash2Icon from '@core/shared/ui/icons/Trash2'
import X2Icon from '@core/shared/ui/icons/X2'

import { BlockDeleteForCoverImage } from '../../../../../__generated__/BlockDeleteForCoverImage'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'
import { CloudflareDetails } from '../VideoFromCloudflare/CloudflareDetails'
import { LocalDetails } from '../VideoFromLocal/LocalDetails'
import { YouTubeDetails } from '../VideoFromYouTube/YouTubeDetails'

export const DRAWER_WIDTH = 328

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
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [blockDeleteForCoverImage] = useMutation<BlockDeleteForCoverImage>(
    BLOCK_DELETE_FOR_COVER_IMAGE
  )
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')

  let Details: (
    props: Pick<VideoDetailsProps, 'id' | 'open' | 'onSelect'>
  ) => ReactElement

  switch (source) {
    case VideoBlockSource.cloudflare:
      Details = CloudflareDetails
      break
    case VideoBlockSource.internal:
      Details = LocalDetails
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
      <Drawer
        SlideProps={{ appear: true }}
        anchor={smUp ? 'right' : 'bottom'}
        variant="temporary"
        open={open}
        elevation={smUp ? 1 : 0}
        hideBackdrop
        sx={{
          left: {
            xs: 0,
            sm: 'unset'
          },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: smUp ? DRAWER_WIDTH : '100%',
            height: '100%'
          }
        }}
        data-testid="VideoDetails"
      >
        <AppBar position="sticky" color="default">
          <Toolbar variant="dense">
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {t('Video Details')}
            </Typography>
            <IconButton
              onClick={() => onClose(false)}
              sx={{ display: 'inline-flex' }}
              edge="end"
              aria-label="Close"
            >
              <X2Icon />
            </IconButton>
          </Toolbar>
        </AppBar>
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
            <Details id={id} open={open} onSelect={handleSelect} />
          </Box>
        </Stack>
      </Drawer>
    </>
  )
}

export default VideoDetails
