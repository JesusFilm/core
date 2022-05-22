import { ReactElement } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { Formik, Form, FormikValues } from 'formik'
import { useJourney } from '@core/journeys/ui'
import { JourneyLanguageUpdate } from '../../../../../__generated__/JourneyLanguageUpdate'
import { Dialog } from '../../../Dialog'
import { LanguageSelect } from '../../../LanguageSelect'
import { GetLanguages } from '../../../../../__generated__/GetLanguages'

export const JOURNEY_LANGUAGE_UPDATE = gql`
  mutation JourneyLanguageUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`

export const GET_LANGUAGES = gql`
  query GetLanguages($languageId: ID) {
    languages(limit: 5000) {
      id
      name(languageId: $languageId, primary: true) {
        value
        primary
      }
    }
  }
`

interface LanguageDialogProps {
  open: boolean
  onClose: () => void
}

export function LanguageDialog({
  open,
  onClose
}: LanguageDialogProps): ReactElement {
  const [journeyUpdate] = useMutation<JourneyLanguageUpdate>(
    JOURNEY_LANGUAGE_UPDATE
  )
  const { data, loading } = useQuery<GetLanguages>(GET_LANGUAGES, {
    variables: { languageId: '529' }
  })

  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    if (journey == null) return

    try {
      await journeyUpdate({
        variables: {
          id: journey.id,
          input: { languageId: values.language.id }
        }
      })
      onClose()
    } catch (error) {
      enqueueSnackbar('There was an error updating language', {
        variant: 'error'
      })
    }
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(
        () =>
          resetForm({
            values: {
              language:
                journey != null
                  ? {
                      id: journey.language.id,
                      localName: journey.language.name.find(
                        ({ primary }) => !primary
                      )?.value,
                      nativeName: journey.language.name.find(
                        ({ primary }) => primary
                      )?.value
                    }
                  : undefined
            }
          }),
        500
      )
    }
  }

  return (
    <>
      {journey != null && (
        <Formik
          initialValues={{
            language:
              journey != null
                ? {
                    id: journey.language.id,
                    localName: journey.language.name.find(
                      ({ primary }) => !primary
                    )?.value,
                    nativeName: journey.language.name.find(
                      ({ primary }) => primary
                    )?.value
                  }
                : undefined
          }}
          onSubmit={handleSubmit}
        >
          {({ values, handleSubmit, resetForm, setFieldValue }) => (
            <Dialog
              open={open}
              handleClose={handleClose(resetForm)}
              dialogTitle={{ title: 'Edit Language' }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: 'Cancel'
              }}
            >
              <Form>
                <LanguageSelect
                  onChange={(value) => setFieldValue('language', value)}
                  value={values.language}
                  languages={data?.languages}
                  loading={loading}
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
