import { ReactElement, useState } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import { Divider, Tab, Tabs, useTheme } from '@mui/material'
import { TabPanel, tabA11yProps } from '@core/shared/ui'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'
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

  const posterBlock = selectedBlock?.children.find(
    (child) => child.id === (selectedBlock as VideoBlock).posterBlockId
  ) as ImageBlock | null

  const handleTabChange = (event, newValue): void => {
    setTabValue(newValue)
  }

  const handleVideoDelete = async (): Promise<void> => {
    setTabValue(0)
    await onDelete()
  }

  return (
    <>
      <ImageBlockHeader
        selectedBlock={posterBlock}
        header={
          selectedBlock?.title == null
            ? 'Select Video File'
            : selectedBlock.title
        }
        caption={
          selectedBlock?.videoContent?.src == null ? 'Formats: MP4, HLS' : ''
        }
        showDelete={selectedBlock?.videoContent?.src != null}
        onDelete={handleVideoDelete}
      />
      <Box
        sx={{
          [theme.breakpoints.up('sm')]: {
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
          <Tab label="Source" {...tabA11yProps('videoSrc', 0)} />
          <Tab
            label="Settings"
            {...tabA11yProps('videoSettings', 1)}
            disabled={selectedBlock?.videoContent?.src == null}
            data-testid="videoSettingsTab"
          />
        </Tabs>
        <Divider />
        <TabPanel name="videoSrc" value={tabValue} index={0}>
          <VideoBlockEditorSource
            selectedBlock={selectedBlock}
            parentBlockId={parentBlockId}
            parentOrder={parentOrder}
            onChange={onChange}
          />
        </TabPanel>
        <TabPanel
          name="videoSettings"
          value={tabValue}
          index={1}
          data-testid="videoSettingsMobile"
        >
          <VideoBlockEditorSettings
            selectedBlock={selectedBlock}
            posterBlock={posterBlock}
            parentOrder={parentOrder}
            onChange={onChange}
            disabled={selectedBlock == null}
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
          disabled={selectedBlock == null}
        />
      </Box>
    </>
  )
}
