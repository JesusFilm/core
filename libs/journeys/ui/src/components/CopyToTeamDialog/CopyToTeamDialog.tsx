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

import { SUPPORTED_LANGUAGE_IDS } from '../../libs/useJourneyAiTranslateMutation/supportedLanguages'
import { useLanguagesQuery } from '../../libs/useLanguagesQuery'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../libs/useUpdateLastActiveTeamIdMutation'
import { UpdateLastActiveTeamId } from '../../libs/useUpdateLastActiveTeamIdMutation/__generated__/UpdateLastActiveTeamId'
import { useTeam } from '../TeamProvider'
import { TranslationDialogWrapper } from '../TranslationDialogWrapper'

interface CopyToTeamDialogProps {
  title: string
  submitLabel?: string
  open: boolean
  loading?: boolean
  onClose: () => void
  submitAction: (
    teamId: string,
    language?: JourneyLanguage,
    showTranslation?: boolean,
    createWithAi?: boolean
  ) => Promise<void>
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
  createWithAi: boolean
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
  submitAction
}: CopyToTeamDialogProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { query, setActiveTeam } = useTeam()
  const teams = query?.data?.teams ?? []
  const [updateLastActiveTeamId, { client }] =
    useMutation<UpdateLastActiveTeamId>(UPDATE_LAST_ACTIVE_TEAM_ID)

  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: [...SUPPORTED_LANGUAGE_IDS]
    }
  })

  async function handleSubmit(
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ): Promise<void> {
    await submitAction(
      values.teamSelect,
      values.languageSelect,
      values.showTranslation,
      values.createWithAi
    )

    setActiveTeam(teams.find((team) => team.id === values.teamSelect) ?? null)
    void updateLastActiveTeamId({
      variables: {
        input: {
          lastActiveTeamId: values.teamSelect
        }
      },
      onCompleted() {
        void client.refetchQueries({ include: ['GetAdminJourneys'] })
      }
    })
    resetForm()
    onClose()
  }

  const baseLanguageShape = {
    id: string(),
    localName: string().optional(),
    nativeName: string().optional()
  }

  const copyToSchema = object({
    teamSelect: string().required(t('Please select a valid team')),
    createWithAi: boolean().required(),
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
        showTranslation: false,
        createWithAi: false
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
            loading &&
            (reason === 'backdropClick' || reason === 'escapeKeyDown')
          )
            return
          onClose()
          resetForm()
        }

        const handleCreateWithAi = async () => {
          await setFieldValue('createWithAi', true)
          handleSubmit()
        }

        return (
          <TranslationDialogWrapper
            open={open}
            onClose={handleDialogClose}
            onTranslate={handleFormSubmit}
            onTranslateWithAi={handleCreateWithAi}
            hasAiButton
            title={title}
            loading={loading || isSubmitting}
            isTranslation={values.showTranslation}
            submitLabel={submitLabel}
            divider={false}
            testId="CopyToTeamDialog"
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
