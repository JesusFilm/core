import { gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import noop from 'lodash/noop'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { JourneySeoTitleUpdate } from '../../../../../../../__generated__/JourneySeoTitleUpdate'

export const JOURNEY_SEO_TITLE_UPDATE = gql`
  mutation JourneySeoTitleUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      seoTitle
    }
  }
`

export function TitleEdit(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
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
          seoTitle: journey.seoTitle ?? ''
        }
      : null

  const seoTitleSchema = object().shape({
    seoTitle: string().max(49, t('Character limit reached'))
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
            <Form style={{ width: '100%' }}>
              <TextField
                id="seoTitle"
                name="seoTitle"
                variant="filled"
                label={t('Headline')}
                fullWidth
                multiline
                maxRows={2}
                value={values.seoTitle}
                error={touched.seoTitle === true && Boolean(errors.seoTitle)}
                helperText={
                  errors.seoTitle != null
                    ? (errors.seoTitle as string)
                    : t('Recommended length: 5 words')
                }
                onChange={handleChange}
                onBlur={(e) => {
                  handleBlur(e)
                  void handleSubmit(e)
                }}
                data-testid="TitleEdit"
                slotProps={{
                  htmlInput: { maxLength: 50 }
                }}
              />
            </Form>
          )}
        </Formik>
      ) : (
        <TextField
          variant="filled"
          label={t('Headline')}
          fullWidth
          disabled
          helperText={t('Recommended length: 5 words')}
          data-testid="TitleEdit"
        />
      )}
    </>
  )
}
