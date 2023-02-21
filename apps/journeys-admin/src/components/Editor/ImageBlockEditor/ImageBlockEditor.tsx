import { ReactElement, SyntheticEvent, useState } from 'react'
import { tabA11yProps, TabPanel } from '@core/shared/ui/TabPanel'
import BrushRounded from '@mui/icons-material/BrushRounded'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { object, string } from 'yup'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'
import { CustomImage } from './CustomImage'

interface ImageBlockEditorProps {
  onChange: (imageBlock: ImageBlock) => Promise<void>
  onDelete?: () => Promise<void>
  selectedBlock: ImageBlock | null
  loading?: boolean
  showAdd?: boolean
}

export function ImageBlockEditor({
  onChange,
  onDelete,
  selectedBlock,
  loading,
  showAdd
}: ImageBlockEditorProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setTabValue(newValue)
  }

  const srcSchema = object().shape({
    src: string().url('Please enter a valid url').required('Required')
  })

  const handleSrcChange = async (src: string): Promise<void> => {
    if (!(await srcSchema.isValid({ src })) || src === selectedBlock?.src)
      return

    const block = {
      ...selectedBlock,
      src,
      alt: src.replace(/(.*\/)*/, '').replace(/\?.*/, '') // per Vlad 26/1/22, we are hardcoding the image alt for now
    }
    await onChange(block as ImageBlock)
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
          showAdd={showAdd}
        />
      </Box>
      <Box data-testid="ImageBlockEditor">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="image selection tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<BrushRounded />}
            label={<Typography variant="subtitle2">Custom</Typography>}
            {...tabA11yProps('custom', 0)}
          />
        </Tabs>
        <TabPanel name="custom" value={tabValue} index={0}>
          <CustomImage onChange={handleSrcChange} />
        </TabPanel>
      </Box>
    </>
  )
}
