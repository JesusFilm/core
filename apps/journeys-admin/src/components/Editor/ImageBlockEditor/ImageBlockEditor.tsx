import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, SyntheticEvent, useState } from 'react'
import { object, string } from 'yup'

import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Image3Icon from '@core/shared/ui/icons/Image3'
import StarsIcon from '@core/shared/ui/icons/Stars'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { setBeaconPageViewed } from '../../../libs/setBeaconPageViewed'
import { ImageBlockHeader } from '../ImageBlockHeader'

import { UnsplashAuthor } from './UnsplashGallery'

const UnsplashGallery = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ImageBlockEditor/UnsplashGallery/UnsplashGallery" */ './UnsplashGallery'
    ).then((mod) => mod.UnsplashGallery),
  { ssr: false }
)

const CustomImage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ImageBlockEditor/CustomImage/CustomImage" */ './CustomImage'
    ).then((mod) => mod.CustomImage),
  { ssr: false }
)

const AIGallery = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ImageBlockEditor/AIGallery/AIGallery" */ './AIGallery'
    ).then((mod) => mod.AIGallery),
  { ssr: false }
)

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
  const router = useRouter()
  const [tabValue, setTabValue] = useState(0)
  const [unsplashAuthor, setUnsplashAuthor] = useState<UnsplashAuthor>()
  const [uploading, setUploading] = useState<boolean>()

  const TabParams = { 0: 'unsplash-image', 1: 'custom-image', 2: 'ai-image' }

  function setRoute(param: string): void {
    router.query.param = param
    void router.push(router)
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setTabValue(newValue)
    const route = TabParams[newValue]
    if (route != null) setRoute(route)
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
    console.log('handle src change')
    console.log(src)
    console.log(src === selectedBlock?.src)
    const valid = await srcSchema.isValid({
      src
    })
    console.log(valid)
    if (!(await srcSchema.isValid({ src })) || src === selectedBlock?.src)
      return

    console.log('didnt return')
    const block = {
      ...selectedBlock,
      src,
      blurhash:
        selectedBlock?.blurhash !== blurhash
          ? undefined
          : selectedBlock?.blurhash,
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
          loading={uploading != null ? uploading : loading}
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
            icon={<Grid1Icon />}
            label={<Typography variant="subtitle2">Gallery</Typography>}
            {...tabA11yProps('gallery', 0)}
          />
          <Tab
            icon={<Image3Icon />}
            label={<Typography variant="subtitle2">Custom</Typography>}
            {...tabA11yProps('custom', 1)}
          />
          <Tab
            icon={<StarsIcon />}
            label={<Typography variant="subtitle2">AI</Typography>}
            {...tabA11yProps('custom', 3)}
          />
        </Tabs>
      </Box>
      <TabPanel
        name="gallery"
        value={tabValue}
        index={0}
        sx={{ flexGrow: 1, overflow: 'scroll' }}
      >
        {tabValue === 0 && <UnsplashGallery onChange={handleUnsplashChange} />}
      </TabPanel>
      <TabPanel
        name="custom"
        value={tabValue}
        index={1}
        sx={{ flexGrow: 1, overflow: 'scroll' }}
      >
        {tabValue === 1 && (
          <CustomImage
            onChange={handleSrcChange}
            setUploading={(upload) => setUploading(upload)}
            selectedBlock={selectedBlock}
            loading={uploading != null ? uploading : loading}
            error={error}
          />
        )}
      </TabPanel>
      <TabPanel
        name="generative"
        value={tabValue}
        index={2}
        sx={{ flexGrow: 1, overflow: 'scroll' }}
      >
        {tabValue === 2 && (
          <AIGallery
            onChange={handleSrcChange}
            setUploading={setUploading}
            loading={uploading != null ? uploading : loading}
          />
        )}
      </TabPanel>
    </>
  )
}
