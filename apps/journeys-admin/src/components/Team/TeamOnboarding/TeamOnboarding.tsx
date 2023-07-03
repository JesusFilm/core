import { ReactElement } from 'react'
import Image from 'next/image'
import Box from '@mui/system/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'
import { Formik, Form, FormikValues, FormikHelpers } from 'formik'
import { ApolloError, gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import taskbarIcon from '../../../../public/taskbar-icon.svg'
import { TEAM_CREATE } from '../TeamCreateDialog/TeamCreateDialog'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { useTeam } from '../TeamProvider'

export function TeamOnboarding(): ReactElement {
  const { setActiveTeam } = useTeam()
  const { t } = useTranslation('apps-journeys-admin')
  const teamSchema = object().shape({
    title: string().required(t('Team Name must be at least one character.'))
  })
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

  async function handleSubmit(
    values: FormikValues,
    { resetForm }: FormikHelpers<FormikValues>
  ): Promise<void> {
    try {
      const { data } = await teamCreate({
        variables: { input: { title: values.title } }
      })
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

  return (
    <Stack
      justifyContent="space-evenly"
      alignItems="center"
      sx={{ height: '100vh', minHeight: 600 }}
    >
      <Stack alignItems="center" sx={{ maxWidth: { xs: 311, md: 397 } }}>
        <Box sx={{ mb: 10, flexShrink: 0 }}>
          <Image src={taskbarIcon} alt="Next Steps" height={43} width={43} />
        </Box>
        <Formik
          initialValues={{ title: '' }}
          onSubmit={handleSubmit}
          validationSchema={teamSchema}
        >
          {({
            values,
            errors,
            handleChange,
            handleSubmit,
            isValid,
            isSubmitting
          }) => (
            <Form>
              <Card>
                <CardHeader
                  title={t('Create Team')}
                  titleTypographyProps={{ variant: 'h6' }}
                  sx={{ py: 5, px: 6 }}
                />
                <CardContent sx={{ p: 6 }}>
                  <Stack spacing={4}>
                    <TextField
                      fullWidth
                      variant="filled"
                      hiddenLabel
                      id="title"
                      name="title"
                      value={values.title}
                      error={Boolean(errors.title)}
                      onChange={handleChange}
                      helperText={errors.title}
                      autoFocus
                    />
                    <Typography gutterBottom>
                      {t(
                        'Create a team to hold your NextStep journeys and collaborate with others.'
                      )}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 4 }}>
                  <Button
                    onClick={() => handleSubmit()}
                    disabled={!isValid || isSubmitting}
                  >
                    {t('Create')}
                  </Button>
                </CardActions>
              </Card>
            </Form>
          )}
        </Formik>
      </Stack>
      <Link
        variant="body2"
        underline="none"
        sx={{
          color: 'primary.main',
          cursor: 'pointer'
        }}
        href="mailto:support@nextstep.is?subject=A question about the terms and conditions form"
      >
        {t('Feedback & Support')}
      </Link>
    </Stack>
  )
}
