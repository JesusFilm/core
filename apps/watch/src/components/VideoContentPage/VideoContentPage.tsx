import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Button from '@mui/material/Button'
import SaveAlt from '@mui/icons-material/SaveAlt'
import Share from '@mui/icons-material/Share'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import 'video.js/dist/video-js.css'

import { VideoHero } from '../Hero'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'
import { useVideo } from '../../libs/videoContext'
import { VideosCarousel } from '../Videos/VideosCarousel/VideosCarousel'
import { CarouselItem } from '../Video/CarouselItem/CarouselItem'

// Usually FeatureFilm, ShortFilm, Episode or Segment Videos
export function VideoContentPage(): ReactElement {
  const { container, children, description } = useVideo()
  const [tabValue, setTabValue] = useState(0)
  const [openShare, setOpenShare] = useState(false)
  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

  return (
    <PageWrapper hero={<VideoHero />}>
      <>
        <ThemeProvider
          themeName={ThemeName.website}
          themeMode={ThemeMode.dark}
          nested
        >
          <Paper elevation={0} square sx={{ pt: '20px' }}>
            {/* TODO: combine content and container children? */}
            {children.length > 0 && (
              <VideosCarousel
                videos={children}
                renderItem={(props: Parameters<typeof CarouselItem>[0]) => {
                  return <CarouselItem {...props} />
                }}
              />
            )}
            {container != null && container.children.length > 0 && (
              <VideosCarousel
                videos={container.children}
                renderItem={(props: Parameters<typeof CarouselItem>[0]) => {
                  return <CarouselItem {...props} />
                }}
              />
            )}
          </Paper>
        </ThemeProvider>
        <Container maxWidth="xxl">
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
                <Typography variant="body1">{description[0]?.value}</Typography>
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
            routes={[]}
            onClose={() => setOpenShare(false)}
          />
        </Container>
      </>
    </PageWrapper>
  )
}
