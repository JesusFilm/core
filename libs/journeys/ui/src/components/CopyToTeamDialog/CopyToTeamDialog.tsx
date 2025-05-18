import { useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
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
    showTranslation?: boolean
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
}

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

  // TODO: Update so only the selected AI model + i18n languages are shown.
  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
  })

  async function handleSubmit(
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ): Promise<void> {
    await submitAction(
      values.teamSelect,
      values.languageSelect,
      values.showTranslation
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
            loading &&
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
            loading={loading ?? isSubmitting}
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
                <Switch
                  checked={values.showTranslation}
                  onChange={(e) =>
                    setFieldValue('showTranslation', e.target.checked)
                  }
                  sx={{
                    ml: -2
                  }}
                />
                <Typography variant="subtitle2" color="text.primary">
                  {t('Translation')}
                </Typography>
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
                />
              )}
            </Stack>
          </TranslationDialogWrapper>
        )
      }}
    </Formik>
  )
}
