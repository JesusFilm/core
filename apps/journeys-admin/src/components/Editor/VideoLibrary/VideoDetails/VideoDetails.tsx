import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SubscriptionsRoundedIcon from '@mui/icons-material/SubscriptionsRounded'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { gql, useMutation } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'
import { LocalDetails } from '../VideoFromLocal/LocalDetails'
import { YouTubeDetails } from '../VideoFromYouTube/YouTubeDetails'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { BlockDeleteForCoverImage } from '../../../../../__generated__/BlockDeleteForCoverImage'

export const DRAWER_WIDTH = 328

export interface VideoDetailsProps {
  open: boolean
  id: string
  onClose: (closeParent?: boolean) => void
  onSelect: (block: VideoBlockUpdateInput) => void
  source: VideoBlockSource
  activeVideo?: boolean
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
  activeVideo
}: VideoDetailsProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [blockDeleteForCoverImage] = useMutation<BlockDeleteForCoverImage>(
    BLOCK_DELETE_FOR_COVER_IMAGE
  )

  const {
    state: { selectedBlock }
  } = useEditor()

  const { journey } = useJourney()

  let Details: (
    props: Pick<VideoDetailsProps, 'id' | 'open' | 'onSelect'>
  ) => ReactElement

  switch (source) {
    case VideoBlockSource.internal:
      Details = LocalDetails
      break
    case VideoBlockSource.youTube:
      Details = YouTubeDetails
      break
  }

  const handleSelect = (block: VideoBlockUpdateInput): void => {
    onSelect(block)
  }

  const handleClearVideo = async (): Promise<void> => {
    const videoBlock = selectedBlock as TreeBlock<VideoBlock>
    const imageBlock = videoBlock?.children.find(
      (child) => child.__typename === 'ImageBlock'
    )
    if (videoBlock.posterBlockId === imageBlock?.id) {
      await blockDeleteForCoverImage({
        variables: {
          blockDeleteId: imageBlock?.id,
          journeyId: journey?.id,
          parentBlockId: imageBlock?.parentBlockId
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
      >
        <AppBar position="static" color="default">
          <Toolbar variant="dense">
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Video Details
            </Typography>
            <IconButton
              onClick={() => onClose(false)}
              sx={{ display: 'inline-flex' }}
              edge="end"
              aria-label="Close"
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Stack sx={{ display: 'flex', justifyContent: 'center' }}>
          {activeVideo === true && (
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
                startIcon={<SubscriptionsRoundedIcon />}
                size="small"
                onClick={() => onClose(false)}
              >
                Change Video
              </Button>
              <IconButton
                onClick={handleClearVideo}
                size="small"
                aria-label="clear-video"
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          )}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              mt: activeVideo === true ? -6 : 0
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
