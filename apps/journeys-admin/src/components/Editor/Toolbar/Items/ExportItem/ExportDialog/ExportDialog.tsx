import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { array, object } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { useEditor } from '@core/journeys/ui/EditorProvider'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
}

export function ExportDialog({
  open,
  onClose
}: ExportDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { steps },
    dispatch
  } = useEditor()

  const jsonSchema = object().shape({
    json: array().json().required('Please enter an array of StepBlocks')
  })
  const [jsonBlocks, useJsonBlocks] = useState<string>(JSON.stringify(steps))

  const handleUpdateFromImport = async (
    values: FormikValues
  ): Promise<void> => {
    console.log('Validate, Load in and refresh journey')
    dispatch({
      type: 'SetImportedStepsAction',
      importedSteps: JSON.parse(values.json)
    })
    onClose()
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(() => resetForm({ values: { title: journey?.title } }))
    }
  }

  useEffect(() => {
    useJsonBlocks(JSON.stringify(steps))
  }, [steps])

  return (
    <>
      {journey != null && (
        <Formik
          initialValues={{
            json: ''
          }}
          onSubmit={handleUpdateFromImport}
          validationSchema={jsonSchema}
        >
          {({ values, errors, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
              dialogTitle={{ title: t('Import Journey') }}
              dialogAction={{
                onSubmit: handleSubmit,
                submitLabel: 'Generate Preview',
                closeLabel: t('Cancel')
              }}
              testId="ExportDialog"
            >
              <Form>
                <CopyTextField
                  label="Export"
                  value={jsonBlocks}
                  messageText="JSON copied"
                  sx={{ mb: 4 }}
                />
                <TextField
                  id="json"
                  name="json"
                  label="Import"
                  fullWidth
                  value={values.json}
                  variant="filled"
                  error={Boolean(errors.json)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={handleChange}
                  helperText={errors.json as string}
                  multiline
                  minRows={5}
                  maxRows={10}
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
