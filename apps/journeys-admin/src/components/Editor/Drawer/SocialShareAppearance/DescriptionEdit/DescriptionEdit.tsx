import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import noop from 'lodash/noop'
import { useJourney } from '../../../../../libs/context'
import { JourneySeoDescriptionUpdate } from '../../../../../../__generated__/JourneySeoDescriptionUpdate'

export const JOURNEY_SEO_DESCRIPTION_UPDATE = gql`
  mutation JourneySeoDescriptionUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      seoDescription
    }
  }
`

export function DescriptionEdit(): ReactElement {
  const [journeyUpdate] = useMutation<JourneySeoDescriptionUpdate>(
    JOURNEY_SEO_DESCRIPTION_UPDATE
  )
  const { description, seoDescription, id } = useJourney()

  async function handleSubmit(e: React.FocusEvent): Promise<void> {
    const target = e.target as HTMLInputElement
    await journeyUpdate({
      variables: {
        id,
        input: {
          seoDescription: target.value
        }
      },
      optimisticResponse: {
        journeyUpdate: {
          id,
          __typename: 'Journey',
          seoDescription: target.value
        }
      }
    })
  }

  const initialValues = {
    socialDescription: seoDescription ?? description ?? ''
  }
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
