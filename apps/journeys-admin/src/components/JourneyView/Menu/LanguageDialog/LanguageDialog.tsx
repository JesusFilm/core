import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { Formik, Form, FormikValues } from 'formik'
import { useJourney } from '@core/journeys/ui'
import { JourneyLanguageUpdate } from '../../../../../__generated__/JourneyLanguageUpdate'
import { Dialog } from '../../../Dialog'
import { LanguageSelect } from '../../../LanguageSelect'

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
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    if (journey == null) return

    try {
      await journeyUpdate({
        variables: {
          id: journey.id,
          input: { languageId: values.languageId }
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
        () => resetForm({ values: { languageId: journey?.language?.id } }),
        500
      )
    }
  }

  return (
    <>
      {journey != null && (
        <Formik
          initialValues={{ languageId: journey.language?.id }}
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
                  onChange={(value) => setFieldValue('languageId', value)}
                  value={values.languageId}
                  currentLanguageId="529"
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
