import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import { ReactElement, useState } from 'react'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Typography from '@mui/material/Typography'
import Tab from '@mui/material/Tab'
import Stack from '@mui/material/Stack'
import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'

interface VideoContentProps {
  video: Video
}

export function VideoContent({ video }: VideoContentProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

  return (
    <Box>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="background tabs"
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          mb: 10,
          '> .MuiTabs-scroller': {
            '> .MuiTabs-indicator': {
              zIndex: 1
            }
          },
          '> .MuiButtonBase-root.MuiTabScrollButton-root': {
            ':first-child': {
              display: 'none'
            },
            ':last-child': {
              width: 40,
              display: 'inline-flex',
              ml: '-40px',
              opacity: 1,
              background:
                'linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 60%)',
              svg: {
                display: 'none'
              }
            }
          }
        }}
      >
        <Tab label="Description" {...tabA11yProps('video-description', 0)} />
        {video.studyQuestions.length !== 0 && (
          <Tab
            label="Discussion Questions"
            {...tabA11yProps('discussion-questions', 1)}
          />
        )}
      </Tabs>
      <TabPanel name="description" value={tabValue} index={0}>
        <Typography
          variant="body1"
          color="#4D4D4D"
          sx={{ whiteSpace: 'pre-wrap' }}
        >
          {video.description[0]?.value}
        </Typography>
      </TabPanel>
      <TabPanel name="discussion-questions" value={tabValue} index={1}>
        <Stack
          direction="column"
          spacing={4}
          sx={{
            pt: 2,
            pb: 2
          }}
        >
          {video.studyQuestions?.map((question, index: number) => (
            <Stack direction="row" spacing={4} alignItems="center" key={index}>
              <Box
                sx={{
                  display: 'flex',
                  minHeight: '38px',
                  minWidth: '38px',
                  backgroundColor: '#EDEDED',
                  borderRadius: '50%',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6">{index + 1}</Typography>
              </Box>
              <Typography key={index} variant="body1" color="#4D4D4D">
                {question.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </TabPanel>
    </Box>
  )
}
