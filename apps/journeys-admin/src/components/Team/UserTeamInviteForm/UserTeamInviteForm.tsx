import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import { gql, useMutation } from '@apollo/client'
import { Form, Formik, FormikHelpers } from 'formik'
import { ObjectSchema, object, string } from 'yup'
import { useTranslation } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useTeam } from '../TeamProvider'
import { UserTeamInviteCreate } from '../../../../__generated__/UserTeamInviteCreate'
import { UserTeamInviteCreateInput } from '../../../../__generated__/globalTypes'

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
}

export function UserTeamInviteForm({
  emails
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
