import { ReactElement, SyntheticEvent, useState } from 'react'
import { tabA11yProps, TabPanel } from '@core/shared/ui/TabPanel'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import BrushRounded from '@mui/icons-material/BrushRounded'
import DashboardRounded from '@mui/icons-material/DashboardRounded'
import { object, string } from 'yup'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'
import { UnsplashAuthor, UnsplashGallery } from './UnsplashGallery'
import { CustomImage } from './CustomImage'

interface ImageBlockEditorProps {
  onChange: (imageBlock: ImageBlock) => Promise<void>
  onDelete?: () => Promise<void>
  selectedBlock: ImageBlock | null
  loading?: boolean
  showAdd?: boolean
  error?: boolean
}

export function ImageBlockEditor({
  onChange,
  onDelete,
  selectedBlock,
  loading,
  showAdd,
  error
}: ImageBlockEditorProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)
  const [unsplashAuthor, setUnsplashAuthor] = useState<UnsplashAuthor>()

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setTabValue(newValue)
  }

  const srcSchema = object().shape({
    src: string().url('Please enter a valid url').required('Required')
  })

  const handleSrcChange = async (
    src: string,
    blurhash?: string,
    width = 0,
    height = 0
  ): Promise<void> => {
    if (!(await srcSchema.isValid({ src })) || src === selectedBlock?.src)
      return

    const block = {
      ...selectedBlock,
      src,
      alt: src.replace(/(.*\/)*/, '').replace(/\?.*/, '') // per Vlad 26/1/22, we are hardcoding the image alt for now
    }
    if ((blurhash?.length ?? 0) > 0) {
      block.blurhash = blurhash
      block.width = width
      block.height = height
    }

    await onChange(block as ImageBlock)
  }

  const handleUnsplashChange = async (
    src: string,
    unsplashAuthor: { fullname: string; username: string },
    blurHash?: string,
    width?: number,
    height?: number
  ): Promise<void> => {
    await handleSrcChange(src, blurHash, width, height)
    setUnsplashAuthor(unsplashAuthor)
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
          error={error}
          unsplashAuthor={unsplashAuthor}
        />
      </Box>
      <Box
        data-testid="ImageBlockEditor"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: (theme) => theme.palette.background.paper
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="image selection tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<DashboardRounded />}
            label={<Typography variant="subtitle2">Gallery</Typography>}
            {...tabA11yProps('gallery', 0)}
          />
          <Tab
            icon={<BrushRounded />}
            label={<Typography variant="subtitle2">Custom</Typography>}
            {...tabA11yProps('custom', 1)}
          />
        </Tabs>
      </Box>
      <TabPanel name="gallery" value={tabValue} index={0}>
        <UnsplashGallery onChange={handleUnsplashChange} />
      </TabPanel>
      <TabPanel name="custom" value={tabValue} index={1}>
        <CustomImage
          onChange={handleSrcChange}
          selectedBlock={selectedBlock}
          loading={loading}
          error={error}
        />
      </TabPanel>
    </>
  )
}
