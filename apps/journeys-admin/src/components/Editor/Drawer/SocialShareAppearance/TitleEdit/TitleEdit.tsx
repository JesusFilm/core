import { ReactElement } from 'react'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import noop from 'lodash/noop'
import { useJourney } from '../../../../../libs/context'

export function TitleEdit(): ReactElement {
  const { title } = useJourney()

  async function handleSubmit(e: React.FocusEvent): Promise<void> {
    const target = e.target as HTMLInputElement
    console.log('Title saved:', target.value)
    // mutation here
  }

  const initialValues = { socialTitle: title ?? '' }
  const socialTitleSchema = object().shape({
    socialTitle: string().max(65, 'Character limit reached: 65') // 65 characters is about 2 lines of text on desktop view
  })

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={socialTitleSchema}
      onSubmit={noop}
    >
      {({ values, touched, errors, handleChange, handleBlur }) => (
        <Form>
          <TextField
            id="socialTitle"
            name="socialTitle"
            variant="filled"
            label="Title"
            fullWidth
            multiline
            maxRows={2}
            value={values.socialTitle}
            error={touched.socialTitle === true && Boolean(errors.socialTitle)}
            helperText={
              errors.socialTitle != null
                ? errors.socialTitle
                : 'Recommended length: 5 words'
            }
            onChange={handleChange}
            onBlur={(e) => {
              handleBlur(e)
              errors.socialTitle == null && handleSubmit(e)
            }}
            sx={{
              pb: 4
            }}
          />
        </Form>
      )}
    </Formik>
  )
}
