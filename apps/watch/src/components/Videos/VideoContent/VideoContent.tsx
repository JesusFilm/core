import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import { ReactElement, useState } from 'react'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Typography from '@mui/material/Typography'
import Tab from '@mui/material/Tab'

export function VideoContent({ data }: any): ReactElement {
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
        <Tab
          label="Discussion Questions"
          {...tabA11yProps('discussion-questions', 1)}
        />
      </Tabs>
      <TabPanel name="video-description" value={tabValue} index={0}>
        <Typography variant="body1">
          {data.video.description[0]?.value}
        </Typography>
      </TabPanel>
      <TabPanel name="discussion-questions" value={tabValue} index={1}>
        {data.video.studyQuestions?.map((question, index) => (
          <Typography key={index} variant="body1">
            {question.value}
          </Typography>
        ))}
      </TabPanel>
    </Box>
  )
}
