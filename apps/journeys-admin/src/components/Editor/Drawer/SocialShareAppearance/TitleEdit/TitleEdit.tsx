import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import noop from 'lodash/noop'
import { useJourney } from '../../../../../libs/context'
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

  const { title, seoTitle, id } = useJourney()

  async function handleSubmit(e: React.FocusEvent): Promise<void> {
    const target = e.target as HTMLInputElement
    await journeyUpdate({
      variables: {
        id,
        input: {
          seoTitle: target.value
        }
      },
      optimisticResponse: {
        journeyUpdate: {
          id,
          __typename: 'Journey',
          seoTitle: target.value
        }
      }
    })
  }

  const initialValues = { seoTitle: seoTitle ?? title }
  const seoTitleSchema = object().shape({
    seoTitle: string().max(65, 'Character limit reached: 65') // 65 characters is about 2 lines of text on desktop view
  })

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={seoTitleSchema}
      onSubmit={noop}
    >
      {({ values, touched, errors, handleChange, handleBlur }) => (
        <Form data-testid="seo-title-form">
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
