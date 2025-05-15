import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik, FormikHelpers } from 'formik'
import sortBy from 'lodash/sortBy'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { InferType, object, string } from 'yup'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useLanguagesQuery } from '../../libs/useLanguagesQuery'
import { useUpdateLastActiveTeamIdMutation } from '../../libs/useUpdateLastActiveTeamIdMutation'
import { useTeam } from '../TeamProvider'
import { TranslationDialogWrapper } from '../TranslationDialogWrapper'

interface CopyToTeamDialogProps {
  title: string
  submitLabel?: string
  open: boolean
  loading?: boolean
  onClose: () => void
  submitAction: (teamId: string, language?: JourneyLanguage) => Promise<void>
}

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

export function CopyToTeamDialog({
  title,
  submitLabel,
  open,
  loading,
  onClose,
  submitAction
}: CopyToTeamDialogProps): ReactElement {
  const { query, setActiveTeam } = useTeam()
  const teams = query?.data?.teams ?? []

  const { t } = useTranslation('libs-journeys-ui')

  // TODO: Update so only the selected AI model + i18n languages are shown.
  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
  })

  const [selectedLanguage, setSelectedLanguage] = useState<
    JourneyLanguage | undefined
  >()

  function handleClose(): void {
    onClose()
    setSelectedLanguage(undefined)
  }

  const copyToSchema = object({
    teamSelect: string().required(t('Please select a valid team'))
  })

  const updateLastActiveTeamId = useUpdateLastActiveTeamIdMutation()

  async function handleSubmit(
    values: InferType<typeof copyToSchema>,
    { resetForm }: FormikHelpers<InferType<typeof copyToSchema>>
  ): Promise<void> {
    await updateLastActiveTeamId({
      variables: {
        input: {
          lastActiveTeamId: values.teamSelect
        }
      }
    })
    await submitAction(values.teamSelect, selectedLanguage)
    // submit action goes before setActiveTeam for proper loading states to be shown
    setActiveTeam(teams.find((team) => team.id === values.teamSelect) ?? null)
    console.log('set active team called')
    resetForm()
  }
  return (
    <Formik
      initialValues={{ teamSelect: teams.length === 1 ? teams[0].id : '' }}
      enableReinitialize
      onSubmit={handleSubmit}
      validationSchema={copyToSchema}
    >
      {({ values, errors, handleChange, handleSubmit, isSubmitting }) => (
        <TranslationDialogWrapper
          open={open}
          onClose={handleClose}
          onTranslate={async () => handleSubmit()}
          title={title}
          loading={loading ?? isSubmitting}
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
            <Typography variant="subtitle2" color="text.secondary">
              {t('Translation Language')}
            </Typography>
            <LanguageAutocomplete
              languages={languagesData?.languages}
              loading={languagesLoading}
              onChange={setSelectedLanguage}
              value={selectedLanguage}
            />
          </Stack>
        </TranslationDialogWrapper>
      )}
    </Formik>
  )
}
