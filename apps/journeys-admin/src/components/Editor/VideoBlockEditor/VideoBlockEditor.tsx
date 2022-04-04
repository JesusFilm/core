import { ReactElement, useState } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { TabPanel, tabA11yProps } from '@core/shared/ui'
import { VideoBlockUpdateInput } from '../../../../__generated__/globalTypes'
import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'
import { VideoBlockEditorSource } from './Source'
import { VideoBlockEditorSettings } from './Settings'

interface VideoBlockEditorProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (input: VideoBlockUpdateInput) => Promise<void>
  showDelete?: boolean
  onDelete?: () => Promise<void>
}

export function VideoBlockEditor({
  selectedBlock,
  showDelete = true,
  onChange,
  onDelete
}: VideoBlockEditorProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)

  const posterBlock = selectedBlock?.children.find(
    (child) => child.id === (selectedBlock as VideoBlock).posterBlockId
  ) as ImageBlock | null

  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

  const handleVideoDelete = async (): Promise<void> => {
    setTabValue(0)
    await onDelete?.()
  }

  return (
    <>
      <ImageBlockHeader
        selectedBlock={posterBlock}
        header={
          selectedBlock?.video?.variant?.hls == null
            ? 'Select Video File'
            : selectedBlock.video.variant.hls
        }
        showDelete={showDelete && selectedBlock?.video != null}
        onDelete={handleVideoDelete}
      />
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
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
            disabled={selectedBlock?.video == null}
            data-testid="videoSettingsTab"
          />
        </Tabs>
        <Divider />
        <TabPanel name="videoSrc" value={tabValue} index={0}>
          <VideoBlockEditorSource
            selectedBlock={selectedBlock}
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
            onChange={onChange}
          />
        </TabPanel>
      </Box>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <VideoBlockEditorSource
          selectedBlock={selectedBlock}
          onChange={onChange}
        />
        <Divider />
        <VideoBlockEditorSettings
          selectedBlock={selectedBlock}
          posterBlock={posterBlock}
          onChange={onChange}
        />
      </Box>
    </>
  )
}
