import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import { gql, useMutation } from '@apollo/client'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { object, string } from 'yup'
import { useTranslation } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useTeam } from '../../TeamProvider'
import { UserTeamInviteCreate } from '../../../../../__generated__/UserTeamInviteCreate'

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
  users: string[]
}

export function UserTeamInviteForm({
  users
}: UserTeamInviteFormProps): ReactElement {
  const [userTeamInviteCreate] = useMutation<UserTeamInviteCreate>(
    USER_TEAM_INVITE_CREATE
  )
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()

  const handleAddUser = async (
    values: FormikValues,
    actions: FormikHelpers<{ email: string }>
  ): Promise<void> => {
    if (activeTeam != null) {
      await userTeamInviteCreate({
        variables: {
          teamId: activeTeam?.id,
          input: {
            email: values.email
          }
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
                  actions.resetForm()
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
    }
  }

  const usersToLowerCase = users?.map((user) => user.toLowerCase())
  const validationSchema = object().shape({
    email: string()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Required'))
      .notOneOf(usersToLowerCase, t('This email is already on the list'))
  })

  return (
    <Formik
      initialValues={{ email: '' }}
      onSubmit={handleAddUser}
      validationSchema={validationSchema}
    >
      {({ values, handleChange, handleBlur, errors, touched }) => (
        <Form noValidate>
          <TextField
            id="email"
            label={t('Email')}
            name="email"
            type="email"
            fullWidth
            variant="filled"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email != null && touched.email != null}
            helperText={
              touched?.email != null && errors.email != null
                ? errors.email
                : t('No email notifications. New users get access instantly.')
            }
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
      )}
    </Formik>
  )
}
