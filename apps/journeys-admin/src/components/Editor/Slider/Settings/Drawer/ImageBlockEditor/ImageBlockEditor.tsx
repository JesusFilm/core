import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, SyntheticEvent, useState } from 'react'
import { object, string } from 'yup'

import { setBeaconPageViewed } from '@core/journeys/ui/setBeaconPageViewed'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Image3Icon from '@core/shared/ui/icons/Image3'
import StarsIcon from '@core/shared/ui/icons/Stars'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'
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
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [tabValue, setTabValue] = useState(0)
  const [unsplashAuthor, setUnsplashAuthor] = useState<UnsplashAuthor>()
  const [uploading, setUploading] = useState<boolean>()

  const TabParams = { 0: 'unsplash-image', 1: 'custom-image', 2: 'ai-image' }

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setTabValue(newValue)
    const route: 'unsplash-image' | 'custom-image' | 'ai-image' =
      TabParams[newValue]
    if (route != null) setRoute(route)
  }

  const srcSchema = object().shape({
    src: string().url(t('Please enter a valid url')).required(t('Required'))
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
        sx={{
          width: '100%',
          height: 183
        }}
      >
        <Box
          sx={{
            width: '100%',
            justifyContent: 'center',
            display: 'flex',
            py: 4
          }}
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
              label={
                <Typography variant="subtitle2">{t('Gallery')}</Typography>
              }
              {...tabA11yProps('gallery', 0)}
            />
            <Tab
              icon={<Image3Icon />}
              label={<Typography variant="subtitle2">{t('Custom')}</Typography>}
              {...tabA11yProps('custom', 1)}
            />
            <Tab
              icon={<StarsIcon />}
              label={<Typography variant="subtitle2">{t('AI')}</Typography>}
              {...tabA11yProps('custom', 3)}
            />
          </Tabs>
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          height: {
            xs: 'calc(100vh - 405px)',
            sm: 'calc(100vh - 375px)'
          },
          overflowY: 'auto'
        }}
      >
        <TabPanel
          name="gallery"
          value={tabValue}
          index={0}
          sx={{ flexGrow: 1, overflow: 'auto' }}
        >
          {tabValue === 0 && (
            <UnsplashGallery onChange={handleUnsplashChange} />
          )}
        </TabPanel>
        <TabPanel
          name="custom"
          value={tabValue}
          index={1}
          sx={{ flexGrow: 1, overflow: 'auto' }}
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
          sx={{ flexGrow: 1, overflow: 'auto' }}
        >
          {tabValue === 2 && (
            <AIGallery
              onChange={handleSrcChange}
              setUploading={setUploading}
              loading={uploading != null ? uploading : loading}
            />
          )}
        </TabPanel>
      </Box>
    </>
  )
}
