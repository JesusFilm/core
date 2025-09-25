import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import last from 'lodash/last'
import { useTranslation } from 'next-i18next'
import {
  ReactElement,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState
} from 'react'

import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { useVideo } from '../../../libs/videoContext'
import { SharingIdeasWall } from '../../SharingIdeasWall'
import { TextFormatter } from '../../TextFormatter'

export function VideoContent(): ReactElement {
  const { description, studyQuestions } = useVideo()
  const [tabValue, setTabValue] = useState(0)
  const { t } = useTranslation('apps-watch')

  const filteredStudyQuestions = useMemo(() => {
    if (!studyQuestions?.length) return []

    const nonPrimaryQuestions = studyQuestions.filter(
      (q) => q.primary === false
    )
    if (nonPrimaryQuestions.length > 0) {
      return nonPrimaryQuestions
    }

    const primaryQuestions = studyQuestions.filter((q) => q.primary === true)
    if (primaryQuestions.length > 0) {
      return primaryQuestions
    }

    return []
  }, [studyQuestions])

  const sharingIdeas = useMemo(() => {
    if (filteredStudyQuestions.length > 0) {
      return filteredStudyQuestions.map((question) => question.value)
    }

    const descriptionText = last(description)?.value?.trim()

    if (descriptionText != null && descriptionText.length > 0) {
      const sentences = descriptionText
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => sentence.length > 0)
        .slice(0, 3)

      if (sentences.length > 0) return sentences
    }

    return [
      t('If you could ask the creator of this video a question, what would it be?')
    ]
  }, [description, filteredStudyQuestions, t])

  const hasDiscussionQuestions = filteredStudyQuestions.length !== 0
  const sharingTabIndex = hasDiscussionQuestions ? 2 : 1

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
        {hasDiscussionQuestions && (
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
        <Tab
          data-testid="sharing-ideas"
          label={
            <Typography variant="overline1">
              {t('Sharing Ideas')}
            </Typography>
          }
          {...tabA11yProps('sharing-ideas', sharingTabIndex)}
        />
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
          {last(description)?.value}
        </TextFormatter>
      </TabPanel>
      {hasDiscussionQuestions && (
        <TabPanel name="discussion-questions" value={tabValue} index={1}>
          <Stack
            direction="column"
            spacing={4}
            sx={{
              py: 2
            }}
          >
            {filteredStudyQuestions.map((question, index: number) => (
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
      <TabPanel
        name="sharing-ideas"
        value={tabValue}
        index={sharingTabIndex}
      >
        <SharingIdeasWall ideas={sharingIdeas} />
      </TabPanel>
    </Box>
  )
}
