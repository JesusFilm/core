import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import noop from 'lodash/noop'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { JourneySeoTitleUpdate } from '../../../../../../__generated__/JourneySeoTitleUpdate'

export const JOURNEY_SEO_TITLE_UPDATE = gql`
  mutation JourneySeoTitleUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      seoTitle
    }
  }
`

export function TitleEdit(): ReactElement {
  const [journeyUpdate] = useMutation<JourneySeoTitleUpdate>(
    JOURNEY_SEO_TITLE_UPDATE
  )

  const { journey } = useJourney()

  async function handleSubmit(e: React.FocusEvent): Promise<void> {
    if (journey == null) return
    const target = e.target as HTMLInputElement
    await journeyUpdate({
      variables: {
        id: journey.id,
        input: {
          seoTitle: target.value
        }
      },
      optimisticResponse: {
        journeyUpdate: {
          id: journey.id,
          __typename: 'Journey',
          seoTitle: target.value
        }
      }
    })
  }

  const initialValues =
    journey != null
      ? {
          seoTitle: journey.seoTitle ?? journey.title
        }
      : null

  const seoTitleSchema = object().shape({
    seoTitle: string().max(50, 'Character limit reached')
  })

  return (
    <>
      {initialValues != null ? (
        <Formik
          initialValues={initialValues}
          validationSchema={seoTitleSchema}
          onSubmit={noop}
        >
          {({ values, touched, errors, handleChange, handleBlur }) => (
            <Form>
              <TextField
                id="seoTitle"
                name="seoTitle"
                variant="filled"
                label="Title"
                fullWidth
                multiline
                maxRows={2}
                value={values.seoTitle}
                error={touched.seoTitle === true && Boolean(errors.seoTitle)}
                helperText={
                  errors.seoTitle != null
                    ? errors.seoTitle
                    : 'Recommended length: 5 words'
                }
                onChange={handleChange}
                onBlur={(e) => {
                  handleBlur(e)
                  errors.seoTitle == null && handleSubmit(e)
                }}
                sx={{
                  pb: 4
                }}
              />
            </Form>
          )}
        </Formik>
      ) : (
        <TextField
          variant="filled"
          label="Title"
          fullWidth
          disabled
          helperText="Recommended length: 5 words"
          sx={{
            pb: 4
          }}
        />
      )}
    </>
  )
}
