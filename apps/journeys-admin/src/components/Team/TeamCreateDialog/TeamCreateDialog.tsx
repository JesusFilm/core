import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, FormikHelpers, FormikValues } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { TeamCreateForm } from '../TeamCreateForm'

interface TeamCreateDialogProps {
  open: boolean
  onClose: () => void
  onCreate: () => void
}

export function TeamCreateDialog({
  open,
  onClose,
  onCreate
}: TeamCreateDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  async function handleSubmit(
    values: FormikValues,
    { resetForm }: FormikHelpers<FormikValues>
  ): Promise<void> {
    handleClose(resetForm)()
    onCreate()
  }

  function handleClose(
    resetForm: FormikHelpers<FormikValues>['resetForm']
  ): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(() => resetForm({}))
    }
  }

  return (
    <TeamCreateForm onSubmit={handleSubmit}>
      {({
        values,
        errors,
        handleChange,
        handleSubmit,
        resetForm,
        isSubmitting
      }) => (
        <Dialog
          open={open}
          onClose={handleClose(resetForm)}
          dialogTitle={{ title: t('Create Team') }}
          dialogAction={{
            onSubmit: () => {
              if (!isSubmitting) handleSubmit()
            },
            closeLabel: t('Cancel'),
            submitLabel: t('Create')
          }}
        >
          <Form>
            <Stack spacing={4}>
              <TextField
                id="title"
                name="title"
                fullWidth
                value={values.title}
                variant="filled"
                error={Boolean(errors.title)}
                onChange={handleChange}
                helperText={
                  errors.title !== undefined
                    ? errors.title
                    : 'Private: Visible only to your team'
                }
                label="Team Name"
              />
              <TextField
                id="publicTitle"
                name="publicTitle"
                fullWidth
                value={values.publicTitle}
                variant="filled"
                error={Boolean(errors.publicTitle)}
                onChange={handleChange}
                helperText={
                  errors.publicTitle !== undefined
                    ? errors.publicTitle
                    : 'Public: Anyone can view it'
                }
                label="Legal Name"
                placeholder={values.title}
              />

              <Stack direction="row" spacing={3} color="text.secondary">
                <InformationCircleContainedIcon
                  sx={{ color: 'secondary.light' }}
                />
                <Typography
                  variant="caption"
                  color="secondary.light"
                  gutterBottom
                >
                  {t(
                    'When visitors click the info icon, they will see text from the Legal Name box. This text can be a mission name, website title, or other public information.'
                  )}
                </Typography>
              </Stack>

              <Typography gutterBottom>
                {t(
                  'Create a team to hold your NextStep journeys and collaborate with others.'
                )}
              </Typography>
            </Stack>
          </Form>
        </Dialog>
      )}
    </TeamCreateForm>
  )
}
