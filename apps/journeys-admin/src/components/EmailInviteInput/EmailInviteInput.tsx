import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { Form, Formik } from 'formik'
import { object, string } from 'yup'
import { useTranslation } from 'react-i18next'

interface EmailInviteInputProps {
  onClose: () => void
}

export function EmailInviteInput({
  onClose
}: EmailInviteInputProps): ReactElement {
  const handleAddUser = (): void => {
    console.log('Blank... for now')
  }

  const { t } = useTranslation('libs-journeys-ui')

  const validationSchema = object().shape({
    name: string()
      .min(2, t('Name must be 2 characters or more'))
      .max(50, t('Name must be 50 characters or less'))
      .required(t('Required')),
    email: string()
      .email(t('Please enter a valid email address'))
      .required(t('Required'))
  })

  return (
    <Formik
      initialValues={{ name: '', email: '' }}
      onSubmit={handleAddUser}
      validationSchema={validationSchema}
    >
      {({ values, handleChange, handleBlur, errors, touched }) => (
        <Form>
          <TextField
            autoFocus
            margin="normal"
            id="email"
            label="Email Address"
            name="email"
            type="email"
            fullWidth
            variant="outlined"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email != null && touched.email}
            helperText={touched?.email != null ? errors.email : ' '}
          />
          <TextField
            margin="normal"
            id="name"
            name="name"
            label="Display Name"
            fullWidth
            variant="outlined"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name != null && touched.name}
            helperText={touched?.name != null ? errors.name : ' '}
          />
          <Button type="submit">Submit</Button>
          <Button onClick={onClose}>Close</Button>
        </Form>
      )}
    </Formik>
  )
}
