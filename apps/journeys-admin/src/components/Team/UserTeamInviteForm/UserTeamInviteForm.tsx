import { gql, useMutation } from '@apollo/client'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikHelpers } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { ObjectSchema, object, string } from 'yup'

import AlertCircle from '@core/shared/ui/icons/AlertCircle'

import {
  UserTeamInviteCreateInput,
  UserTeamRole
} from '../../../../__generated__/globalTypes'
import { UserTeamInviteCreate } from '../../../../__generated__/UserTeamInviteCreate'
import { useTeam } from '../TeamProvider'

export const USER_TEAM_INVITE_CREATE = gql`
  mutation UserTeamInviteCreate(
    $teamId: ID!
    $input: UserTeamInviteCreateInput
  ) {
    userTeamInviteCreate(teamId: $teamId, input: $input) {
      email
      id
      teamId
    }
  }
`

interface UserTeamInviteFormProps {
  emails: string[]
  role: UserTeamRole | undefined
}

export function UserTeamInviteForm({
  emails,
  role
}: UserTeamInviteFormProps): ReactElement {
  const [userTeamInviteCreate] = useMutation<UserTeamInviteCreate>(
    USER_TEAM_INVITE_CREATE
  )
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()

  async function handleSubmit(
    input: UserTeamInviteCreateInput,
    { resetForm }: FormikHelpers<UserTeamInviteCreateInput>
  ): Promise<void> {
    if (activeTeam != null) {
      await userTeamInviteCreate({
        variables: {
          teamId: activeTeam?.id,
          input
        },
        update(cache, { data }) {
          if (data?.userTeamInviteCreate != null) {
            cache.modify({
              fields: {
                userTeamInvites(existingUserTeamInviteRefs = []) {
                  const newUserTeamInvite = cache.writeFragment({
                    data: data.userTeamInviteCreate,
                    fragment: gql`
                      fragment NewUserTeamInvite on UserTeamInvite {
                        id
                      }
                    `
                  })
                  return [
                    ...existingUserTeamInviteRefs.filter(
                      (ref) => ref.__ref !== newUserTeamInvite?.__ref
                    ),
                    newUserTeamInvite
                  ]
                }
              }
            })
          }
        }
      })
      resetForm()
    }
  }

  const userTeamInviteCreateSchema: ObjectSchema<UserTeamInviteCreateInput> =
    object({
      email: string()
        .lowercase()
        .email(t('Please enter a valid email address'))
        .required(t('Required'))
        .notOneOf(emails, t('This email is already on the list'))
    })

  const initialValues: UserTeamInviteCreateInput = { email: '' }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={userTeamInviteCreateSchema}
    >
      {({ values, handleChange, handleBlur, errors, touched }) => (
        <>
          <Form noValidate autoComplete="off">
            <TextField
              label={t('Email')}
              name="email"
              fullWidth
              disabled={role !== 'manager'}
              variant="filled"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email != null && touched.email != null}
              helperText={
                role !== UserTeamRole.manager
                  ? t('Only a manager can invite new members to the team')
                  : touched?.email != null && errors.email != null
                  ? errors.email
                  : null
              }
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="submit"
                      aria-label="add user"
                      color="primary"
                      disabled={values.email === ''}
                    >
                      <AddCircleOutlineIcon
                        sx={{
                          color:
                            values.email !== '' && errors.email == null
                              ? 'primary.main'
                              : null
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Form>
          <Stack
            direction="row"
            sx={{
              pt: errors.email != null && touched.email != null ? 4.5 : '39px',
              pb: 4
            }}
          >
            <Box sx={{ pr: 3 }}>
              <AlertCircle sx={{ color: 'secondary.light' }} />
            </Box>
            <Typography sx={{ color: 'secondary.light' }} variant="body2">
              {t(
                'No email notifications. New members get access instantly. Team members can see all analytics, edit any journey, and delete and copy journey.'
              )}
            </Typography>
          </Stack>
        </>
      )}
    </Formik>
  )
}
