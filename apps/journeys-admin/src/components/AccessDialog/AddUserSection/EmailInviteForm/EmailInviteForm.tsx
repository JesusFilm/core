import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import { gql, useMutation } from '@apollo/client'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { object, string } from 'yup'
import { useTranslation } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
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
}

export function EmailInviteForm({ users }: EmailInviteFormProps): ReactElement {
  const [userInviteCreate] = useMutation<UserInviteCreate>(CREATE_USER_INVITE)
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const handleAddUser = async (
    values: FormikValues,
    actions: FormikHelpers<{ email: string }>
  ): Promise<void> => {
    if (journey != null) {
      await userInviteCreate({
        variables: {
          journeyId: journey.id,
          input: {
            email: values.email
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

  const validationSchema = object().shape({
    email: string()
      .strict()
      .lowercase()
      .email(t('Please enter a valid email address'))
      .required(t('Required'))
      .notOneOf(users, t('This email is already on the list'))
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
