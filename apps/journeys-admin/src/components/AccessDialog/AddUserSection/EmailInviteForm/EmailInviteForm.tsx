import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'

import { UserInviteCreate } from '../../../../../__generated__/UserInviteCreate'

export const CREATE_USER_INVITE = gql`
  mutation UserInviteCreate($journeyId: ID!, $input: UserInviteCreateInput!) {
    userInviteCreate(journeyId: $journeyId, input: $input) {
      id
      email
      removedAt
      acceptedAt
    }
  }
`

interface EmailInviteFormProps {
  users: string[]
  journeyId: string
}

export function EmailInviteForm({
  users,
  journeyId
}: EmailInviteFormProps): ReactElement {
  const [userInviteCreate] = useMutation<UserInviteCreate>(CREATE_USER_INVITE)
  const { t } = useTranslation('apps-journeys-admin')

  const handleAddUser = async (
    values: FormikValues,
    actions: FormikHelpers<{ email: string }>
  ): Promise<void> => {
    if (journeyId != null) {
      await userInviteCreate({
        variables: {
          journeyId,
          input: {
            email: values.email.trim().toLowerCase()
          }
        },
        update(cache, { data }) {
          // Update cache if no existing userInvite or re-inviting removed invite
          if (data?.userInviteCreate != null) {
            cache.modify({
              fields: {
                userInvites(existingUserInviteRefs = []) {
                  const existingInvite = cache.identify({
                    __typename: 'UserInvite',
                    id: data?.userInviteCreate?.id
                  })
                  const userInviteRef = cache.writeFragment({
                    id: existingInvite,
                    data: data.userInviteCreate,
                    fragment: gql`
                      fragment NewUserInvite on UserInvite {
                        id
                      }
                    `
                  })

                  actions.resetForm()

                  return [
                    ...existingUserInviteRefs.filter(
                      (ref) => ref.__ref !== existingInvite
                    ),
                    userInviteRef
                  ]
                }
              }
            })
          }
        }
      })
    }
  }

  const usersToLowerCase = users.map((user) => user.toLowerCase())
  const validationSchema = object().shape({
    email: string()
      .trim()
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
        <Form noValidate autoComplete="off">
          <TextField
            label={t('Email')}
            name="email"
            fullWidth
            variant="filled"
            value={values.email}
            autoComplete="off"
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email != null && touched.email != null}
            helperText={
              touched?.email != null && errors.email != null
                ? (errors.email as string)
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
                    <AddSquare4Icon
                      sx={{
                        color:
                          values.email !== '' && errors.email == null
                            ? 'primary.main'
                            : 'secondary.light'
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
