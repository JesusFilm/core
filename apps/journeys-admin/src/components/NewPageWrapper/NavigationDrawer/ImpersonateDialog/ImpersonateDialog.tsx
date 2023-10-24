import { ApolloError, gql, useApolloClient, useMutation } from '@apollo/client'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'

import {
  UserImpersonate,
  UserImpersonateVariables
} from '../../../../../__generated__/UserImpersonate'

export const USER_IMPERSONATE = gql`
  mutation UserImpersonate($email: String!) {
    userImpersonate(email: $email)
  }
`

interface ImpersonateDialogProps {
  open: boolean
  onClose: () => void
}

export function ImpersonateDialog({
  open,
  onClose
}: ImpersonateDialogProps): ReactElement {
  const [userImpersonate] = useMutation<
    UserImpersonate,
    UserImpersonateVariables
  >(USER_IMPERSONATE)
  const client = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')

  async function handleSubmit(
    values: FormikValues,
    formikHelpers: FormikHelpers<FormikValues>
  ): Promise<void> {
    try {
      const { data } = await userImpersonate({
        variables: {
          email: values.email
        }
      })
      if (data?.userImpersonate != null) {
        const auth = getAuth()
        await signInWithCustomToken(auth, data.userImpersonate)
        await client.resetStore()
      }
      handleClose(formikHelpers.resetForm)()
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            t('Impersonation failed. Reload the page or try again.'),
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
      setTimeout(() => resetForm({ values: { email: '' } }))
    }
  }

  return (
    <Formik initialValues={{ email: '' }} onSubmit={handleSubmit}>
      {({ values, handleChange, handleSubmit, resetForm, isSubmitting }) => (
        <Dialog
          open={open}
          onClose={handleClose(resetForm)}
          dialogTitle={{ title: t('Impersonate User') }}
          dialogAction={{
            onSubmit: handleSubmit,
            closeLabel: t('Cancel'),
            submitLabel: t('Impersonate')
          }}
          loading={isSubmitting}
        >
          <Form>
            <Alert severity="warning" sx={{ mb: 5 }}>
              <AlertTitle>{t('Warning')}</AlertTitle>
              <Typography gutterBottom>
                {t(
                  'By impersonating a user you will be able to use Next Steps on behalf of another user.'
                )}{' '}
                <strong>
                  {t(
                    "You must get permission from the user before impersonating them. Unauthorized access to a user's data may be illegal and punishable by law in some juristictions."
                  )}
                </strong>
              </Typography>

              <Typography>
                {t(
                  'Impersonation sessions last one hour. However, you should sign out from their account ASAP.'
                )}
              </Typography>
            </Alert>
            <TextField
              id="email"
              name="email"
              label={t('User Email Address')}
              fullWidth
              value={values.email}
              variant="filled"
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
