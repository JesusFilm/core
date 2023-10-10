import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, FormikHelpers, FormikValues } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'

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
          data-testid="TeamCreateDialog"
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
