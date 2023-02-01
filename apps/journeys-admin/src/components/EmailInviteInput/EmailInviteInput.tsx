import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { object, string } from 'yup'
import { useTranslation } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

export function EmailInviteInput(): ReactElement {
  const handleAddUser = (): void => {
    console.log('Blank... for now')
  }

  const { t } = useTranslation('libs-journeys-ui')

  const validationSchema = object().shape({
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
            id="email"
            label="Add Editor By Email"
            name="email"
            type="email"
            fullWidth
            variant="filled"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email != null && touched.email}
            helperText={
              touched?.email != null
                ? errors.email
                : "Users invited by email don't require approval"
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit">
                    <AddCircleOutlineIcon />
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
