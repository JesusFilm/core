import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik, FormikHelpers } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { InferType, object, string } from 'yup'

import { PageProps } from '../HomePage/HomePage'

export function PasswordResetPage({
  userEmail,
  setActivePage
}: PageProps): ReactElement {
  const { t } = useTranslation()
  const validationSchema = object().shape({
    email: string()
      .trim()
      .lowercase()
      .email(t('Please enter a valid email address.'))
      .required(t('Please enter your email address.'))
  })

  async function PasswordReset(
    values: InferType<typeof validationSchema>,
    actions: FormikHelpers<InferType<typeof validationSchema>>
  ): Promise<void> {
    // Needs custom emailing server
    // https://firebase.google.com/docs/auth/admin/email-action-links#generate_password_reset_email_link
  }

  return (
    <>
      <Formik
        initialValues={{ email: `${userEmail}` }}
        validationSchema={validationSchema}
        onSubmit={PasswordReset}
      >
        <Stack gap={4}>
          <Typography variant="h6" textAlign="left">
            {t('Reset Password')}
          </Typography>
          <Typography textAlign="left">
            {t(
              'Get instructions sent to this email that explain how to reset your password.'
            )}
          </Typography>
          <TextField
            variant="standard"
            defaultValue={t(`${userEmail}`)}
            required
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'left',
              justifyContent: 'flex-end'
            }}
          >
            <Button size="large" onClick={() => setActivePage('home')}>
              {t('CANCEL')}
            </Button>
            <Button size="large" variant="contained">
              {t('SEND')}
            </Button>
          </Box>
        </Stack>
      </Formik>
    </>
  )
}
