import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import noop from 'lodash/noop'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
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

  const { journey } = useJourney()

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

  const initialValues =
    journey != null
      ? {
          seoDescription: journey.seoDescription ?? journey.description ?? ''
        }
      : null

  const seoDescriptionSchema = object().shape({
    seoDescription: string().max(180, 'Character limit reached') // 180 characters just a few more words than 18 on average
  })

  return (
    <>
      {initialValues != null ? (
        <Formik
          initialValues={initialValues}
          validationSchema={seoDescriptionSchema}
          onSubmit={noop}
        >
          {({ values, touched, errors, handleChange, handleBlur }) => (
            <Form>
              <TextField
                id="seoDescription"
                name="seoDescription"
                variant="filled"
                label="Description"
                fullWidth
                multiline
                maxRows={5}
                value={values.seoDescription}
                error={
                  touched.seoDescription === true &&
                  Boolean(errors.seoDescription)
                }
                helperText={
                  errors.seoDescription != null
                    ? errors.seoDescription
                    : 'Recommended length: up to 18 words'
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
      ) : (
        <TextField
          variant="filled"
          label="Description"
          fullWidth
          disabled
          helperText="Recommended length: up to 18 words"
          sx={{
            pb: 6
          }}
        />
      )}
    </>
  )
}
