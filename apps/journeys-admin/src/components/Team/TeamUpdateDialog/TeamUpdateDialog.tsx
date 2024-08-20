import { ApolloError, gql, useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { Dialog } from '@core/shared/ui/Dialog'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { TeamUpdate } from '../../../../__generated__/TeamUpdate'

export const TEAM_UPDATE = gql`
  mutation TeamUpdate($id: ID!, $input: TeamUpdateInput!) {
    teamUpdate(id: $id, input: $input) {
      id
      title
      publicTitle
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
      .max(40, t('Max 40 Characters'))
      .matches(/^(?!\s+$).*/g, t('This field cannot contain only blankspaces')),
    publicTitle: string().max(40, t('Max 40 Characters'))
  })

  async function handleSubmit(
    values: FormikValues,
    { resetForm }: FormikHelpers<FormikValues>
  ): Promise<void> {
    try {
      const { data } = await teamUpdate({
        variables: {
          id: activeTeam?.id,
          input: { title: values.title, publicTitle: values.publicTitle }
        }
      })
      handleClose(resetForm)()

      enqueueSnackbar(
        data !== null && data !== undefined && data?.teamUpdate.title !== ''
          ? t('{{ teamName }} updated.', { teamName: data.teamUpdate.title })
          : t('Team updated.'),
        {
          variant: 'success',
          preventDuplicate: true
        }
      )
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
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
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
      initialValues={{
        title: activeTeam?.title ?? '',
        publicTitle: activeTeam?.publicTitle ?? ''
      }}
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
          testId="TeamUpdateDialog"
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
                    ? (errors.title as string)
                    : t('Private: Visible only to your team')
                }
                label={t('Team Name')}
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
                    ? (errors.publicTitle as string)
                    : t('Public: Anyone can view it')
                }
                label={t('Legal Name')}
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
            </Stack>
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
