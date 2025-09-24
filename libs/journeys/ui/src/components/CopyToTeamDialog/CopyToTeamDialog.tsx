import { useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik, FormikHelpers } from 'formik'
import sortBy from 'lodash/sortBy'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { boolean, object, string } from 'yup'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { SUPPORTED_LANGUAGE_IDS } from '../../libs/useJourneyAiTranslateSubscription/supportedLanguages'
import { useLanguagesQuery } from '../../libs/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../libs/useUpdateLastActiveTeamIdMutation'
import { UpdateLastActiveTeamId } from '../../libs/useUpdateLastActiveTeamIdMutation/__generated__/UpdateLastActiveTeamId'
import { useTeam } from '../TeamProvider'
import { TranslationDialogWrapper } from '../TranslationDialogWrapper'
import { useJourney } from '../../libs/JourneyProvider'
import { useRouter } from 'next/router'

interface CopyToTeamDialogProps {
  title: string
  submitLabel?: string
  open: boolean
  loading?: boolean
  onClose: () => void
  submitAction: (
    teamId: string,
    language?: JourneyLanguage,
    showTranslation?: boolean
  ) => Promise<void>
  translationProgress?: {
    progress: number
    message: string
  }
  isTranslating?: boolean
}

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

interface FormValues {
  teamSelect: string
  languageSelect?: JourneyLanguage
  showTranslation: boolean
}

/**
 * CopyToTeamDialog component provides a dialog interface for copying journeys to different teams with optional translation.
 *
 * This component:
 * - Displays a form dialog for selecting a target team
 * - Provides language selection when translation is enabled
 * - Handles form validation using Formik and Yup
 * - Manages team selection and updates the last active team
 * - Supports customizable dialog title and submit button label
 * - Shows loading states during submission
 *
 * @param {Object} props - The component props
 * @param {string} props.title - The title to display in the dialog header
 * @param {string} [props.submitLabel] - Optional custom label for the submit button
 * @param {boolean} props.open - Controls the visibility of the dialog
 * @param {boolean} [props.loading] - Optional flag to indicate loading state
 * @param {() => void} props.onClose - Callback function invoked when the dialog should close
 * @param {(teamId: string, language?: JourneyLanguage, showTranslation?: boolean) => Promise<void>} props.submitAction -
 *        Callback function that handles the form submission with selected team, optional language, and translation preference
 * @returns {ReactElement} A dialog component with team selection and optional translation settings
 */
export function CopyToTeamDialog({
  title,
  submitLabel,
  open,
  loading,
  onClose,
  submitAction,
  translationProgress,
  isTranslating = false
}: CopyToTeamDialogProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { query, setActiveTeam } = useTeam()
  const { journey } = useJourney()
  const teams = query?.data?.teams ?? []
  const [updateLastActiveTeamId, { client }] =
    useMutation<UpdateLastActiveTeamId>(UPDATE_LAST_ACTIVE_TEAM_ID)

  const { pathname } = useRouter()
  const isTemplatesAdmin = pathname.includes('/publisher')
  const isOriginalTemplate =
    journey?.template && journey?.fromTemplateId == null

  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: [...SUPPORTED_LANGUAGE_IDS]
    }
  })

  const updateTeamState = (teamId: string): void => {
    setActiveTeam(teams.find((team) => team.id === teamId) ?? null)
    void updateLastActiveTeamId({
      variables: {
        input: {
          lastActiveTeamId: teamId
        }
      },
      onCompleted() {
        void client.refetchQueries({ include: ['GetAdminJourneys'] })
      }
    })
  }

  async function handleSubmit(
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ): Promise<void> {
    await submitAction(
      values.teamSelect,
      values.languageSelect,
      values.showTranslation
    )

    // Update team state
    updateTeamState(values.teamSelect)

    // Always reset the form after submission
    resetForm()

    // Only close dialog immediately if translation is not enabled
    // If translation is enabled, the dialog will be closed when translation completes
    if (!values.showTranslation) {
      onClose()
    }
  }

  const baseLanguageShape = {
    id: string(),
    localName: string().optional(),
    nativeName: string().optional()
  }

  const copyToSchema = object({
    teamSelect: string().required(t('Please select a valid team')),
    showTranslation: boolean().required(),
    languageSelect: object(baseLanguageShape)
      .nullable()
      .when('showTranslation', {
        is: true,
        then: (schema) =>
          schema.required(t('Please select a language')).shape({
            id: string().required(t('Please select a language'))
          }),
        otherwise: (schema) => schema.nullable().optional()
      })
  })

  return (
    <Formik<FormValues>
      initialValues={{
        teamSelect: teams.length === 1 ? teams[0].id : '',
        languageSelect: undefined,
        showTranslation: false
      }}
      enableReinitialize
      onSubmit={handleSubmit}
      validationSchema={copyToSchema}
    >
      {({
        values,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting,
        setFieldValue,
        touched,
        setTouched,
        resetForm
      }): ReactElement => {
        const handleFormSubmit = async () => {
          await setTouched({
            teamSelect: true,
            ...(values.showTranslation ? { languageSelect: true } : {})
          })
          handleSubmit()
        }

        const handleDialogClose = (
          _?: object,
          reason?: 'backdropClick' | 'escapeKeyDown'
        ): void => {
          if (
            (loading || isTranslating) &&
            (reason === 'backdropClick' || reason === 'escapeKeyDown')
          )
            return
          onClose()
          resetForm()
        }

        return (
          <TranslationDialogWrapper
            open={open}
            onClose={handleDialogClose}
            onTranslate={handleFormSubmit}
            title={title}
            loading={loading || isSubmitting}
            isTranslation={values.showTranslation || isTranslating}
            submitLabel={submitLabel}
            divider={false}
            testId="CopyToTeamDialog"
            translationProgress={translationProgress}
          >
            <Stack direction="column" spacing={4}>
              <FormControl variant="filled" hiddenLabel fullWidth>
                <TextField
                  name="teamSelect"
                  select
                  error={Boolean(errors.teamSelect)}
                  helperText={
                    (errors.teamSelect as string) ??
                    t('Journey will be copied to selected team.')
                  }
                  variant="filled"
                  label={t('Select Team')}
                  data-testid="team-duplicate-select"
                  disabled={isSubmitting}
                  value={values.teamSelect}
                  onChange={(e) => {
                    handleChange(e)
                  }}
                  slotProps={{
                    select: {
                      IconComponent: ChevronDownIcon
                    }
                  }}
                  sx={{
                    '& >.MuiFormHelperText-contained': {
                      ml: 0
                    }
                  }}
                >
                  {(query?.data?.teams != null
                    ? sortBy(query.data?.teams, 'title')
                    : []
                  ).map((team) => (
                    <MenuItem
                      key={team.id}
                      value={team.id}
                      aria-label={team.title}
                      sx={{
                        display: 'block',
                        whiteSpace: 'normal',
                        wordWrap: 'break-word'
                      }}
                    >
                      {team.title}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
              <Stack direction="row" alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      disabled={!isOriginalTemplate && isTemplatesAdmin}
                      checked={values.showTranslation}
                      onChange={(e) =>
                        setFieldValue('showTranslation', e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography variant="subtitle2" color="text.primary">
                      {t('Translation')}
                    </Typography>
                  }
                />
              </Stack>
              {!isOriginalTemplate && isTemplatesAdmin && (
                <Typography variant="caption" color="red">
                  {t(
                    'This is not the original journey template, it is a translation or copy of the original template. If you want to translate this journey - please use the original template.'
                  )}
                </Typography>
              )}
              {values.showTranslation && (
                <LanguageAutocomplete
                  languages={languagesData?.languages}
                  loading={languagesLoading}
                  helperText={
                    touched.languageSelect && errors.languageSelect
                      ? (errors.languageSelect as { id?: string })?.id
                      : ''
                  }
                  onChange={(value) => setFieldValue('languageSelect', value)}
                  error={
                    touched.languageSelect && Boolean(errors.languageSelect)
                  }
                  value={values.languageSelect}
                  data-testid="language-select"
                />
              )}
            </Stack>
          </TranslationDialogWrapper>
        )
      }}
    </Formik>
  )
}
