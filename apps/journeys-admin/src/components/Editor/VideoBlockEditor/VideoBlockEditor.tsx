import { ReactElement, useState } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import {
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material'
import { DeleteOutline } from '@mui/icons-material'
import { TabPanel, tabA11yProps } from '@core/shared/ui'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { ImageBlockThumbnail } from '../ImageBlockThumbnail/ImageBlockThumbnail'
import { VideoBlockEditorSource } from './Source/VideoBlockEditorSource'
import { VideoBlockEditorSettings } from './Settings/VideoBlockEditorSettings'

interface VideoBlockEditorProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  parentBlockId: string
  parentOrder: number
  onChange: (block: TreeBlock<VideoBlock>) => Promise<void>
  onDelete: () => Promise<void>
}

export function VideoBlockEditor({
  selectedBlock,
  parentBlockId,
  parentOrder,
  onChange,
  onDelete
}: VideoBlockEditorProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)
  const theme = useTheme()

  const [posterBlock, setPosterBlock] = useState(
    selectedBlock?.children.find(
      (child) => child.id === (selectedBlock as VideoBlock).posterBlockId
    ) as ImageBlock | null
  )

  const handleTabChange = (event, newValue): void => {
    setTabValue(newValue)
  }

  const handleVideoDelete = async (): Promise<void> => {
    setPosterBlock(null)
    setTabValue(0)
    await onDelete()
  }

  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        <Stack direction="row" spacing="16px" data-testid="videoSrcStack">
          <ImageBlockThumbnail selectedBlock={posterBlock} />
          <Stack direction="column" justifyContent="center">
            {selectedBlock?.title == null && (
              <Typography variant="subtitle2">Select Video File</Typography>
            )}
            {selectedBlock?.title != null && (
              <Typography
                variant="subtitle2"
                sx={{
                  maxWidth: 130,
                  width: 130,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {selectedBlock?.title}
              </Typography>
            )}
            <Typography variant="caption">
              {selectedBlock?.videoContent?.src == null
                ? 'Formats: MP4, HLS'
                : ''}
              &nbsp;
            </Typography>
          </Stack>
          {(selectedBlock as TreeBlock<VideoBlock>)?.videoContent?.src !=
            null && (
            <Stack direction="column" justifyContent="center">
              <IconButton onClick={handleVideoDelete} data-testid="deleteVideo">
                <DeleteOutline color="primary" />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Box>
      <Box
        sx={{
          [theme.breakpoints.up('md')]: {
            display: 'none'
          }
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="background tabs"
          centered
          variant="fullWidth"
        >
          <Tab label="Source" {...tabA11yProps('videSrc', 0)} />
          <Tab
            label="Settings"
            {...tabA11yProps('videoSettings', 1)}
            disabled={
              (selectedBlock as TreeBlock<VideoBlock>)?.videoContent?.src ==
              null
            }
            data-testid="videoSettingsTab"
          />
        </Tabs>
        <TabPanel name="videoSrc" value={tabValue} index={0}>
          <VideoBlockEditorSource
            selectedBlock={selectedBlock}
            parentBlockId={parentBlockId}
            parentOrder={parentOrder}
            onChange={onChange}
          />
        </TabPanel>
        <TabPanel name="videoSettings" value={tabValue} index={1}>
          <VideoBlockEditorSettings
            selectedBlock={selectedBlock}
            posterBlock={posterBlock}
            parentOrder={parentOrder}
            onChange={onChange}
          />
        </TabPanel>
      </Box>
      <Box sx={{ [theme.breakpoints.down('sm')]: { display: 'none' } }}>
        <VideoBlockEditorSource
          selectedBlock={selectedBlock}
          parentBlockId={parentBlockId}
          parentOrder={parentOrder}
          onChange={onChange}
        />
        <Divider />
        <VideoBlockEditorSettings
          selectedBlock={selectedBlock}
          posterBlock={posterBlock}
          parentOrder={parentOrder}
          onChange={onChange}
        />
      </Box>
    </>
  )
}
