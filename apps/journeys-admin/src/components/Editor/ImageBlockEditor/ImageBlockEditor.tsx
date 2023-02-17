import { ReactElement, SyntheticEvent, useState } from 'react'
import { tabA11yProps, TabPanel } from '@core/shared/ui/TabPanel'
import BrushRounded from '@mui/icons-material/BrushRounded'
import DashboardRounded from '@mui/icons-material/DashboardRounded'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { object, string } from 'yup'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'
import { CustomImage } from '../ImageLibrary/CustomImage'
import { ImageUpload } from '../ImageLibrary/CustomImage/ImageUpload'

interface ImageBlockEditorProps {
  onChange: (src: string) => Promise<void>
  onDelete?: () => Promise<void>
  selectedBlock: ImageBlock | null
  loading?: boolean
  noSource?: boolean
}

export function ImageBlockEditor({
  onChange,
  onDelete,
  selectedBlock,
  loading,
  noSource
}: ImageBlockEditorProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setTabValue(newValue)
  }

  return (
    <>
      <Box
        sx={{ width: '100%', justifyContent: 'center', display: 'flex', py: 4 }}
      >
        <ImageBlockHeader
          selectedBlock={selectedBlock}
          onDelete={onDelete}
          loading={loading}
        />
      </Box>
      <Box data-testid="ImageLibrary">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="image selection tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<DashboardRounded />}
            label={<Typography variant="subtitle2">Unsplash</Typography>}
            {...tabA11yProps('unsplash', 0)}
          />
          <Tab
            icon={<BrushRounded />}
            label={<Typography variant="subtitle2">Custom</Typography>}
            {...tabA11yProps('custom', 1)}
          />
        </Tabs>
        <TabPanel name="unsplash" value={tabValue} index={0}>
          {/* insert unsplash component */}
        </TabPanel>
        <TabPanel name="custom" value={tabValue} index={1}>
          <ImageUpload onChange={onChange} loading={loading} />
          <CustomImage onChange={onChange} />
        </TabPanel>
      </Box>
    </>
  )
}
