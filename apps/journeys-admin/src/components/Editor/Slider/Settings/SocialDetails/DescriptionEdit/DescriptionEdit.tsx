import { gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import noop from 'lodash/noop'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { JourneySeoDescriptionUpdate } from '../../../../../../../__generated__/JourneySeoDescriptionUpdate'

export const JOURNEY_SEO_DESCRIPTION_UPDATE = gql`
  mutation JourneySeoDescriptionUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      seoDescription
    }
  }
`

export function DescriptionEdit(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
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
          seoDescription: journey.seoDescription ?? ''
        }
      : null

  const seoDescriptionSchema = object().shape({
    seoDescription: string().max(180, t('Character limit reached')) // 180 characters just a few more words than 18 on average
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
                label={t('Secondary Text')}
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
                    ? (errors.seoDescription as string)
                    : t('Recommended length: up to 18 words')
                }
                onChange={handleChange}
                onBlur={(e) => {
                  handleBlur(e)
                  if (errors.seoDescription == null) void handleSubmit(e)
                }}
                sx={{
                  pb: 6
                }}
                data-testid="DescriptionEdit"
              />
            </Form>
          )}
        </Formik>
      ) : (
        <TextField
          variant="filled"
          label={t('Secondary Text')}
          fullWidth
          disabled
          helperText={t('Recommended length: up to 18 words')}
          sx={{
            pb: 6
          }}
          data-testid="DescriptionEdit"
        />
      )}
    </>
  )
}
