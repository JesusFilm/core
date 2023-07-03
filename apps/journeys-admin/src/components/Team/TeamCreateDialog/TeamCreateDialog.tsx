import { ReactElement } from 'react'
import { useMutation, gql, ApolloError } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Dialog } from '@core/shared/ui/Dialog'
import { useSnackbar } from 'notistack'
import { Formik, Form, FormikValues, FormikHelpers } from 'formik'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'
import Typography from '@mui/material/Typography'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { useTeam } from '../TeamProvider'

export const TEAM_CREATE = gql`
  mutation TeamCreate($input: TeamCreateInput!) {
    teamCreate(input: $input) {
      id
      title
    }
  }
`

interface TeamCreateDialogProps {
  open: boolean
  onClose: () => void
}

export function TeamCreateDialog({
  open,
  onClose
}: TeamCreateDialogProps): ReactElement {
  const { setActiveTeam } = useTeam()
  const { t } = useTranslation('apps-journeys-admin')
  const [teamCreate] = useMutation<TeamCreate>(TEAM_CREATE, {
    update(cache, { data }) {
      if (data?.teamCreate != null) {
        cache.modify({
          fields: {
            teams(existingTeams = []) {
              const newTeamRef = cache.writeFragment({
                data: data.teamCreate,
                fragment: gql`
                  fragment NewTeam on Team {
                    id
                  }
                `
              })
              return [...existingTeams, newTeamRef]
            }
          }
        })
      }
    },
    onCompleted(data) {
      if (data?.teamCreate != null) {
        setActiveTeam(data.teamCreate)
      }
    }
  })
  const { enqueueSnackbar } = useSnackbar()
  const teamSchema = object().shape({
    title: string().required(t('Team Name must be at least one character.'))
  })

  async function handleSubmit(
    values: FormikValues,
    { resetForm }: FormikHelpers<FormikValues>
  ): Promise<void> {
    try {
      const { data } = await teamCreate({
        variables: { input: { title: values.title } }
      })
      handleClose(resetForm)()
      enqueueSnackbar(
        t('{{ teamName }} created.', {
          teamName: data?.teamCreate.title ?? 'Team'
        }),
        {
          variant: 'success',
          preventDuplicate: true
        }
      )
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            t('Failed to create the team. Reload the page or try again.'),
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
    <Formik
      initialValues={{ title: '' }}
      onSubmit={handleSubmit}
      validationSchema={teamSchema}
    >
      {({ values, errors, handleChange, handleSubmit, resetForm }) => (
        <Dialog
          open={open}
          onClose={handleClose(resetForm)}
          dialogTitle={{ title: t('Create Team') }}
          dialogAction={{
            onSubmit: handleSubmit,
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
              label="Team Name"
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
    </Formik>
  )
}
