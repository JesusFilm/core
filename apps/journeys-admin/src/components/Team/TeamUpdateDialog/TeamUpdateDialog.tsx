import { ApolloError, gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'

import { TeamUpdate } from '../../../../__generated__/TeamUpdate'
import { useTeam } from '../TeamProvider'

export const TEAM_UPDATE = gql`
  mutation TeamUpdate($id: ID!, $input: TeamUpdateInput!) {
    teamUpdate(id: $id, input: $input) {
      id
      title
    }
  }
`

interface TeamUpdateDialogProps {
  open: boolean
  onClose: () => void
}

export function TeamUpdateDialog({
  open,
  onClose
}: TeamUpdateDialogProps): ReactElement {
  const { activeTeam } = useTeam()
  const { t } = useTranslation('apps-journeys-admin')
  const [teamUpdate] = useMutation<TeamUpdate>(TEAM_UPDATE)
  const { enqueueSnackbar } = useSnackbar()
  const teamSchema = object({
    title: string()
      .required(t('Team Name must be at least one character.'))
      .max(40, t('Max {{ count }} Characters', { count: 40 }))
  })

  async function handleSubmit(
    values: FormikValues,
    { resetForm }: FormikHelpers<FormikValues>
  ): Promise<void> {
    try {
      const { data } = await teamUpdate({
        variables: { id: activeTeam?.id, input: { title: values.title } }
      })
      handleClose(resetForm)()
      enqueueSnackbar(t(`${data?.teamUpdate.title ?? 'Team'} updated.`), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            t('Failed to update the team. Reload the page or try again.'),
            {
              variant: 'error',
              preventDuplicate: true
            }
          )
          return
        }
      }
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(() => resetForm({}))
    }
  }

  return (
    <Formik
      initialValues={{ title: activeTeam?.title ?? '' }}
      onSubmit={handleSubmit}
      validationSchema={teamSchema}
      enableReinitialize
    >
      {({ values, errors, handleChange, handleSubmit, resetForm }) => (
        <Dialog
          open={open}
          onClose={handleClose(resetForm)}
          dialogTitle={{ title: t('Change Team Name') }}
          dialogAction={{
            onSubmit: handleSubmit,
            closeLabel: t('Cancel'),
            submitLabel: t('Save')
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
              label="Team Name"
            />
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
