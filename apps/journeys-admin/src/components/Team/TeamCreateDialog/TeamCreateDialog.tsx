import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import { Dialog } from '@core/shared/ui/Dialog'
import { Form, FormikValues, FormikHelpers } from 'formik'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import { TeamCreateForm } from '../TeamCreateForm'

interface TeamCreateDialogProps {
  open: boolean
  onClose: () => void
}

export function TeamCreateDialog({
  open,
  onClose
}: TeamCreateDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  async function handleSubmit(
    values: FormikValues,
    { resetForm }: FormikHelpers<FormikValues>
  ): Promise<void> {
    handleClose(resetForm)()
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
            <TextField
              id="title"
              name="title"
              fullWidth
              value={values.title}
              variant="filled"
              error={Boolean(errors.title)}
              onChange={handleChange}
              helperText={errors.title}
              label={t('Team Name')}
              autoFocus
            />
            <Typography pt={5}>
              {t(
                'Create a team to hold your NextStep journeys and collaborate with others.'
              )}
            </Typography>
          </Form>
        </Dialog>
      )}
    </TeamCreateForm>
  )
}
