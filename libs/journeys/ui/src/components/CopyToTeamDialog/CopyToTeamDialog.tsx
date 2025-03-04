import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { Formik, FormikHelpers } from 'formik'
import sortBy from 'lodash/sortBy'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { InferType, object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { useUpdateLastActiveTeamIdMutation } from '../../libs/useUpdateLastActiveTeamIdMutation'
import { useTeam } from '../TeamProvider'

interface CopyToTeamDialogProps {
  title: string
  submitLabel?: string
  open: boolean
  loading?: boolean
  onClose: () => void
  submitAction: (teamId: string) => Promise<void>
}

export function CopyToTeamDialog({
  title,
  submitLabel = 'Copy',
  open,
  loading,
  onClose,
  submitAction
}: CopyToTeamDialogProps): ReactElement {
  const { query, setActiveTeam } = useTeam()
  const teams = query?.data?.teams ?? []

  const { t } = useTranslation('libs-journeys-ui')
  function handleClose(): void {
    onClose()
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
    // submit action goes before setActiveTeam for proper loading states to be shown
    await submitAction(values.teamSelect)
    setActiveTeam(teams.find((team) => team.id === values.teamSelect) ?? null)
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
        <Dialog
          open={open}
          onClose={handleClose}
          dialogTitle={{ title: t(title) }}
          loading={loading ?? isSubmitting}
          dialogAction={{
            onSubmit: () => {
              if (!isSubmitting) handleSubmit()
            },
            closeLabel: t('Cancel'),
            submitLabel: submitLabel === 'Add' ? t('Add') : t('Copy')
          }}
          testId="CopyToTeamDialog"
        >
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
        </Dialog>
      )}
    </Formik>
  )
}
