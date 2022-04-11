import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import noop from 'lodash/noop'
import { useJourney } from '../../../../../libs/context'

export function DescriptionEdit(): ReactElement {
  const { description } = useJourney()

  async function handleSubmit(e: React.FocusEvent): Promise<void> {
    const target = e.target as HTMLInputElement
    console.log('Description saved:', target.value)
    // mutation here
  }

  const initialValues = { socialDescription: description ?? '' }
  const socialDescriptionSchema = object().shape({
    socialDescription: string().max(180, 'Character limit reached') // 180 characters just a few more words than 18 on average
  })

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={socialDescriptionSchema}
      onSubmit={noop}
    >
      {({ values, touched, errors, handleChange, handleBlur }) => (
        <Form>
          <TextField
            id="socialDescription"
            name="socialDescription"
            variant="filled"
            label="Description"
            fullWidth
            multiline
            maxRows={5}
            value={values.socialDescription}
            error={
              touched.socialDescription === true &&
              Boolean(errors.socialDescription)
            }
            helperText={
              errors.socialDescription != null
                ? errors.socialDescription
                : 'Recommended length: up to 18 words'
            }
            onChange={handleChange}
            onBlur={(e) => {
              handleBlur(e)
              errors.socialDescription == null && handleSubmit(e)
            }}
            sx={{
              pb: 6
            }}
          />
        </Form>
      )}
    </Formik>
  )
}
