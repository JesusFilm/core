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
    <Box width="100%">
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="background tabs"
        sx={{ mb: 10 }}
      >
        <Tab label="Description" {...tabA11yProps('video-description', 0)} />
        {video.studyQuestions.length !== 0 && (
          <Tab
            label="Discussion Questions"
            {...tabA11yProps('discussion-questions', 1)}
          />
        )}
      </Tabs>
      <TabPanel name="video-description" value={tabValue} index={0}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
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
            <>
              <Stack direction="row" spacing={4} alignItems="center">
                <Box
                  sx={{
                    display: 'flex',
                    height: '38px',
                    width: '38px',
                    backgroundColor: '#EDEDED',
                    borderRadius: '50%',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h6">{index + 1}</Typography>
                </Box>

                <Typography key={index} variant="body1">
                  {question.value}
                </Typography>
              </Stack>
            </>
          ))}
        </Stack>
      </TabPanel>
    </Box>
  )
}
