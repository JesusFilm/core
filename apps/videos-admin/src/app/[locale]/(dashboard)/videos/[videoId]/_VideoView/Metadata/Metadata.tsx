import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { GetLanguages_languages as Language } from '@core/journeys/ui/useLanguagesQuery/__generated__/GetLanguages'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { Section } from '../Section'

import { StudyQuestionsList } from './StudyQuestionsList'
import { VideoDescription } from './VideoDescription'
import { VideoImage } from './VideoImage'
import { VideoImageAlt } from './VideoImageAlt'
import { VideoInformation } from './VideoInformation'
import { VideoSnippet } from './VideoSnippet'

interface MetadataProps {
  video: AdminVideo
  loading: boolean
  missingLanguages?: Language[]
  selectedLanguage: string
  onLanguageChange: (event: { target: { value: string } }) => void
  onCreateVariant: () => Promise<void>
}

export function Metadata({
  video,
  loading,
  missingLanguages,
  selectedLanguage,
  onLanguageChange,
  onCreateVariant
}: MetadataProps): ReactElement {
  const t = useTranslations()

  return (
    <Stack gap={2} data-testid="VideoMetadata">
      {loading ? (
        <Box sx={{ height: 240, display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Section title={t('Information')} variant="outlined">
            <VideoInformation video={video} />
          </Section>
          {missingLanguages != null && missingLanguages.length > 0 && (
            <Section title={t('Language Variants')} variant="outlined">
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="missing-language-label">
                    {t('Add Language Variant')}
                  </InputLabel>
                  <Select
                    labelId="missing-language-label"
                    value={selectedLanguage}
                    onChange={onLanguageChange}
                    label={t('Add Language Variant')}
                  >
                    {missingLanguages.map((language) => (
                      <MenuItem key={language.id} value={language.id}>
                        {language.name.find((name) => name.primary)?.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={onCreateVariant}
                  disabled={!selectedLanguage}
                  color="secondary"
                >
                  {t('Create Variant')}
                </Button>
              </Stack>
            </Section>
          )}
          <Section title={t('Image')} variant="outlined">
            <Stack gap={4}>
              <VideoImage video={video} />
              <VideoImageAlt videoImageAlts={video.imageAlt} />
            </Stack>
          </Section>
          <Section title={t('Short Description')} variant="outlined">
            <VideoSnippet videoSnippets={video.snippet} />
          </Section>
          <Section title={t('Description')} variant="outlined">
            <VideoDescription videoDescriptions={video.description} />
          </Section>
          <StudyQuestionsList studyQuestions={video.studyQuestions} />
        </>
      )}
    </Stack>
  )
}
