import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react'

import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { useVideo } from '../../../libs/videoContext'
import { TextFormatter } from '../../TextFormatter'

export function VideoContent(): ReactElement {
  const { description, studyQuestions } = useVideo()
  const [tabValue, setTabValue] = useState(0)
  const { t } = useTranslation('apps-watch')
  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setTabValue(newValue)
  }

  useEffect(() => {
    setTabValue(0)
  }, [description])

  return (
    <Box width="100%" data-testid="VideoContent">
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="background tabs"
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          mb: { xs: 5, md: 10 },
          // Styling to fade out tabs with long label
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
        <Tab
          label={
            <Typography variant="overline1">{t('Description')}</Typography>
          }
          {...tabA11yProps('description', 0)}
        />
        {studyQuestions?.length !== 0 && (
          <Tab
            data-testid="discussion"
            label={
              <>
                <Typography
                  variant="overline1"
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                >
                  {t('Discussion')}
                </Typography>
                <Typography
                  variant="overline1"
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  {t('Discussion Questions')}
                </Typography>
              </>
            }
            {...tabA11yProps('discussion-questions', 1)}
          />
        )}
      </Tabs>
      <TabPanel name="description" value={tabValue} index={0}>
        <TextFormatter
          slotProps={{
            typography: {
              variant: 'body1',
              color: 'text.secondary',
              gutterBottom: true
            }
          }}
        >
          {description[0]?.value}
        </TextFormatter>
      </TabPanel>
      {studyQuestions?.length !== 0 && (
        <TabPanel name="discussion-questions" value={tabValue} index={1}>
          <Stack
            direction="column"
            spacing={4}
            sx={{
              py: 2
            }}
          >
            {studyQuestions?.map((question, index: number) => (
              <Stack
                direction="row"
                spacing={4}
                alignItems="center"
                key={index}
              >
                <Box
                  sx={{
                    display: 'flex',
                    minHeight: 42,
                    minWidth: 42,
                    backgroundColor: '#EDEDED',
                    borderRadius: '50%',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h5">{index + 1}</Typography>
                </Box>
                <Typography
                  key={index}
                  variant="subtitle1"
                  color="text.secondary"
                >
                  {question.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </TabPanel>
      )}
    </Box>
  )
}
