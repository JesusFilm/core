import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { array, object } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'

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
  const [strippedJson, useStrippedJson] = useState<string>('')

  function mergeObjects(exportObj, importObj) {
    importObj.forEach((importItem) => {
      const exportItem = exportObj.find((item) => item.id === importItem.id)
      if (exportItem) {
        if (importItem.children?.length > 0) {
          mergeObjects(exportItem.children, importItem.children)
        } else {
          Object.keys(importItem).forEach((key) => {
            exportItem[key] = importItem[key]
          })
        }
      }
    })
    return exportObj
  }

  const handleUpdateFromImport = async (
    values: FormikValues
  ): Promise<void> => {
    console.log('Validate, Load in and refresh journey')

    const exportedSteps = JSON.parse(jsonBlocks)
    const importedSteps = JSON.parse(values.json)
    const updatedSteps = mergeObjects(exportedSteps, importedSteps)

    dispatch({
      type: 'SetImportedStepsAction',
      importedSteps: updatedSteps
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

  function stripContent(
    obj: TreeBlock,
    allowedKeys: string[]
  ): Partial<TreeBlock> {
    const stripped: Partial<TreeBlock> = Object.keys(obj).reduce((acc, key) => {
      if (allowedKeys.includes(key)) {
        if (Array.isArray(obj[key])) {
          acc[key] = obj[key]
            .map((item) => stripContent(item, allowedKeys))
            .filter((child) => Object.keys(child).length > 1)
        } else if (typeof obj[key] === 'object') {
          const strippedChild = stripContent(obj[key], allowedKeys)
          if (Object.keys(strippedChild).length > 1) {
            acc[key] = strippedChild
          }
        } else {
          acc[key] = obj[key]
        }
      }
      return acc
    }, {} as TreeBlock)

    if (stripped.children?.every((child) => Object.keys(child).length === 1)) {
      delete stripped.children
    }
    return stripped
  }

  useEffect(() => {
    useJsonBlocks(JSON.stringify(steps))
  }, [steps])

  useEffect(() => {
    const originalJson = JSON.parse(jsonBlocks)
    const allowedKeys = ['id', 'content', 'label', 'children', 'submitLabel']

    const strippedArr = originalJson.map((obj) =>
      stripContent(obj, allowedKeys)
    )
    console.log('send stripped JSON to AI', strippedArr)
    useStrippedJson(JSON.stringify(strippedArr))
  }, [jsonBlocks])

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
                <CopyTextField
                  label="StrippedExport"
                  value={strippedJson}
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
                  helperText={
                    (errors.json as string) ??
                    'Import works with all keys or stripped'
                  }
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
