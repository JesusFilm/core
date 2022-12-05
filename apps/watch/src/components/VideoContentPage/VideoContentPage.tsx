import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Button from '@mui/material/Button'
import SaveAlt from '@mui/icons-material/SaveAlt'
import Share from '@mui/icons-material/Share'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import 'video.js/dist/video-js.css'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { LanguageProvider } from '../../libs/languageContext/LanguageContext'
import { VideoHero } from '../Hero'
import { PageWrapper } from '../PageWrapper'
import { VideosCarousel } from '../Videos/VideosCarousel/VideosCarousel'
import { ShareDialog } from '../ShareDialog'

interface VideoContentPageProps {
  container?: VideoContentFields
  content: VideoContentFields
}

// Usually FeatureFilm, ShortFilm, Episode or Segment Videos
export function VideoContentPage({
  container,
  content
}: VideoContentPageProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)
  const [openShare, setOpenShare] = useState(false)
  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

  return (
    <LanguageProvider>
      <PageWrapper hero={<VideoHero video={content} />}>
        {content != null && (
          <>
            <Box sx={{ pt: '20px' }}>
              {/* TODO: combine content and container children? */}
              {content?.children.length > 0 && (
                <VideosCarousel
                  videos={content.children}
                  routePrefix={content.slug}
                  routeSuffix={content.variant?.slug.split('/')[1]}
                />
              )}
              {container != null && container.children.length > 0 && (
                <VideosCarousel
                  videos={container.children}
                  routePrefix={container.slug}
                  routeSuffix={container.variant?.slug.split('/')[1]}
                />
              )}
            </Box>
            <Stack
              direction="row"
              spacing="100px"
              sx={{
                mx: 0,
                mt: 20,
                mb: 80,
                maxWidth: '100%'
              }}
            >
              <Box width="100%">
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="background tabs"
                  variant="fullWidth"
                  centered
                  sx={{ marginBottom: '40px' }}
                >
                  <Tab
                    label="Description"
                    {...tabA11yProps('video-description', 0)}
                  />
                </Tabs>
                <TabPanel name="video-description" value={tabValue} index={0}>
                  <Typography variant="body1">
                    {content.description[0]?.value}
                  </Typography>
                </TabPanel>
              </Box>
              <Box width="336px">
                <Stack direction="row" spacing="20px" mb="40px">
                  <Button variant="outlined">
                    <SaveAlt />
                    &nbsp; Download
                  </Button>
                  <Button variant="outlined" onClick={() => setOpenShare(true)}>
                    <Share />
                    &nbsp; Share
                  </Button>
                </Stack>
              </Box>
            </Stack>
            <ShareDialog
              open={openShare}
              video={content}
              routes={[]}
              onClose={() => setOpenShare(false)}
            />
          </>
        )}
      </PageWrapper>
    </LanguageProvider>
  )
}
