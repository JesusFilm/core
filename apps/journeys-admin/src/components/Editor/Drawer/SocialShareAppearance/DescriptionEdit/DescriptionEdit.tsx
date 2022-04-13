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

  const journey = useJourney()

  async function handleSubmit(e: React.FocusEvent): Promise<void> {
    if (journey == null) return
    const target = e.target as HTMLInputElement
    await journeyUpdate({
      variables: {
        id: journey.id,
        input: {
          seoDescription: target.value
        }
      },
      optimisticResponse: {
        journeyUpdate: {
          id: journey.id,
          __typename: 'Journey',
          seoDescription: target.value
        }
      }
    })
  }

  const initialValues = {
    seoDescription: journey?.seoDescription ?? journey?.description ?? ''
  }
  const seoDescriptionSchema = object().shape({
    seoDescription: string().max(180, 'Character limit reached') // 180 characters just a few more words than 18 on average
  })

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={seoDescriptionSchema}
      onSubmit={noop}
    >
      {({ values, touched, errors, handleChange, handleBlur }) => (
        <Form data-testid="seo-description-form">
          <TextField
            disabled={journey == null}
            id="seoDescription"
            name="seoDescription"
            variant="filled"
            label="Description"
            fullWidth
            multiline
            maxRows={5}
            value={values.seoDescription}
            error={
              touched.seoDescription === true && Boolean(errors.seoDescription)
            }
            helperText={
              errors.seoDescription != null
                ? errors.seoDescription
                : `${values.seoDescription.length as string} / 180 characters`
            }
            onChange={handleChange}
            onBlur={(e) => {
              handleBlur(e)
              errors.seoDescription == null && handleSubmit(e)
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
