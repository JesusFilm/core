import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, SyntheticEvent, useState } from 'react'
import { object, string } from 'yup'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Image3Icon from '@core/shared/ui/icons/Image3'
import StarsIcon from '@core/shared/ui/icons/Stars'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'
import { ImageBlockHeader } from '../ImageBlockHeader'

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
  onChange: (input: ImageBlockUpdateInput) => Promise<void>
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

  const srcSchema = object().shape({ src: string().url().required() })

  const handleSrcChange = async (
    input: ImageBlockUpdateInput
  ): Promise<void> => {
    if (input.src === selectedBlock?.src || !(await srcSchema.isValid(input)))
      return

    const block: ImageBlockUpdateInput = {
      ...input,
      // per Vlad 26/1/22, we are hardcoding the image alt for now
      alt:
        input.alt != null
          ? input.alt
          : input.src?.replace(/(.*\/)*/, '').replace(/\?.*/, '')
    }
    await onChange(block)
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
            <UnsplashGallery
              onChange={handleSrcChange}
              selectedBlock={selectedBlock}
            />
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
              selectedBlock={selectedBlock}
            />
          )}
        </TabPanel>
      </Box>
    </>
  )
}
