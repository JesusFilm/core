import FolderIcon from '@mui/icons-material/Folder'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikHelpers } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'

import { getGoogleOAuthUrl } from '../../../../../libs/googleOAuthUrl'

import { SyncFormValues } from '../types'

interface Integration {
  __typename: string
  id: string
  accountEmail?: string | null
}

interface AddSyncFormDialogProps {
  open: boolean
  onClose: () => void
  pickerActive: boolean
  integrations: Integration[]
  teamId: string | undefined
  journeyTitle: string | undefined
  sheetsLoading: boolean
  onSubmit: (
    values: SyncFormValues,
    actions: FormikHelpers<SyncFormValues>
  ) => Promise<void>
  onOpenDrivePicker: (
    mode: 'folder' | 'sheet',
    integrationId: string | undefined,
    setFieldValue: (field: string, value: unknown) => void
  ) => Promise<void>
  routerAsPath: string
}

export function AddSyncFormDialog({
  open,
  onClose,
  pickerActive,
  integrations,
  teamId,
  journeyTitle,
  sheetsLoading,
  onSubmit,
  onOpenDrivePicker,
  routerAsPath
}: AddSyncFormDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const googleIntegrations = integrations.filter(
    (integration) => integration.__typename === 'IntegrationGoogle'
  )

  const validationSchema = object().shape({
    integrationId: string().required(t('Integration account is required')),
    sheetName: string().required(t('Sheet tab name is required')),
    spreadsheetTitle: string().when(
      'googleMode',
      (googleMode: unknown, schema) =>
        googleMode === 'create'
          ? schema.required(t('Sheet name is required'))
          : schema.notRequired()
    )
  })

  const initialValues: SyncFormValues = {
    integrationId: '',
    googleMode: '',
    spreadsheetTitle: '',
    sheetName: '',
    folderId: undefined,
    folderName: undefined,
    existingSpreadsheetId: undefined,
    existingSpreadsheetName: undefined
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        errors,
        touched,
        resetForm,
        setFieldValue
      }) => (
        <Dialog
          open={open}
          onClose={() => {
            onClose()
            resetForm()
          }}
          dialogTitle={{
            title: t('Sync to Google Sheets'),
            closeButton: true
          }}
          divider={false}
          maxWidth="sm"
          sx={{
            zIndex: pickerActive ? 1 : undefined
          }}
          dialogActionChildren={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  onClose()
                  resetForm()
                }}
                sx={{
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: '20px',
                  px: 2,
                  py: '10px'
                }}
              >
                {t('Cancel')}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleSubmit()}
                loading={sheetsLoading}
                disabled={
                  values.integrationId === '' ||
                  values.sheetName === '' ||
                  (values.googleMode === 'create' &&
                    values.spreadsheetTitle === '' &&
                    (journeyTitle ?? '') === '') ||
                  (values.googleMode === 'existing' &&
                    (values.existingSpreadsheetId == null ||
                      values.existingSpreadsheetId === '')) ||
                  (errors.integrationId != null &&
                    touched.integrationId != null) ||
                  (errors.sheetName != null && touched.sheetName != null) ||
                  (values.googleMode === 'create' &&
                    errors.spreadsheetTitle != null &&
                    touched.spreadsheetTitle != null)
                }
                sx={{
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: '20px',
                  px: '12px',
                  py: '10px'
                }}
              >
                {t('Create Sync')}
              </Button>
            </Box>
          }
        >
          <Form>
            <input
              type="hidden"
              name="folderId"
              value={values.folderId ?? ''}
            />
            <input
              type="hidden"
              name="folderName"
              value={values.folderName ?? ''}
            />
            <input
              type="hidden"
              name="existingSpreadsheetId"
              value={values.existingSpreadsheetId ?? ''}
            />
            <input
              type="hidden"
              name="existingSpreadsheetName"
              value={values.existingSpreadsheetName ?? ''}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl
                fullWidth
                error={
                  errors.integrationId != null &&
                  touched.integrationId != null
                }
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: '24px',
                    mb: 1
                  }}
                >
                  {t('Google Account')}
                </Typography>
                <Select
                  name="integrationId"
                  value={values.integrationId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  displayEmpty
                  inputProps={{ 'aria-label': t('Integration account') }}
                  IconComponent={ChevronDown}
                  sx={{ mb: 1 }}
                  renderValue={(selected) => {
                    if (selected === '')
                      return t('Select integration account')
                    const found = integrations.find(
                      (integration) => integration.id === selected
                    )
                    if (found?.__typename === 'IntegrationGoogle') {
                      return found.accountEmail ?? t('Unknown email')
                    }
                    return t('Unknown integration')
                  }}
                >
                  <MenuItem value="" disabled>
                    {t('Select integration account')}
                  </MenuItem>
                  {googleIntegrations.map((integration) => (
                    <MenuItem key={integration.id} value={integration.id}>
                      {integration.accountEmail ?? t('Unknown email')}
                    </MenuItem>
                  ))}
                </Select>
                {touched.integrationId != null &&
                  errors.integrationId != null && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 2 }}
                    >
                      {errors.integrationId }
                    </Typography>
                  )}
                <Button
                  variant="text"
                  color="primary"
                  href={(() => {
                    if (teamId == null || typeof window === 'undefined')
                      return undefined

                    const url = new URL(routerAsPath, window.location.origin)
                    url.searchParams.set('openSyncDialog', 'true')
                    const returnTo = url.pathname + url.search

                    return getGoogleOAuthUrl(teamId, returnTo)
                  })()}
                  sx={{
                    alignSelf: 'flex-end',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '16px',
                    px: 1,
                    py: 0.75
                  }}
                  disabled={teamId == null}
                >
                  {t('Add New Google Account')}
                </Button>
              </FormControl>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '18px',
                      fontWeight: 600,
                      lineHeight: '24px',
                      mb: 1
                    }}
                  >
                    {t('Spreadsheet Setup')}
                  </Typography>
                  <Select
                    name="googleMode"
                    value={values.googleMode}
                    onChange={handleChange}
                    IconComponent={ChevronDown}
                    inputProps={{ 'aria-label': t('Destination') }}
                    displayEmpty
                    renderValue={(selected: string) => {
                      if (selected === '') return t('Select an option')
                      if (selected === 'create') return t('Create new sheet')
                      if (selected === 'existing')
                        return t('Use existing spreadsheet')
                      return ''
                    }}
                  >
                    <MenuItem value="" disabled>
                      {t('Select an option')}
                    </MenuItem>
                    <MenuItem value="create">
                      {t('Create new sheet')}
                    </MenuItem>
                    <MenuItem value="existing">
                      {t('Use existing spreadsheet')}
                    </MenuItem>
                  </Select>
                </FormControl>

                {values.googleMode !== '' && (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
                  >
                    {values.googleMode === 'create' ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<FolderIcon />}
                          onClick={() =>
                            onOpenDrivePicker(
                              'folder',
                              values.integrationId || undefined,
                              setFieldValue
                            )
                          }
                          sx={{
                            fontSize: '15px',
                            fontWeight: 600,
                            lineHeight: '18px',
                            justifyContent: 'flex-start',
                            alignSelf: 'flex-start',
                            px: '9px',
                            py: '7px',
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2
                            }
                          }}
                        >
                          {values.folderId
                            ? (values.folderName ?? values.folderId)
                            : t('Choose folder')}
                        </Button>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '12px',
                            lineHeight: '16px',
                            color: 'text.secondary',
                            ml: 2
                          }}
                        >
                          {t(
                            'Optional: Choose a folder in Google Drive to store your new spreadsheet.'
                          )}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() =>
                            onOpenDrivePicker(
                              'sheet',
                              values.integrationId || undefined,
                              setFieldValue
                            )
                          }
                          sx={{
                            fontSize: '15px',
                            fontWeight: 600,
                            lineHeight: '18px',
                            justifyContent: 'flex-start',
                            alignSelf: 'flex-start',
                            px: '9px',
                            py: '7px',
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2
                            }
                          }}
                        >
                          {values.existingSpreadsheetId
                            ? (values.existingSpreadsheetName ??
                              values.existingSpreadsheetId)
                            : t('Choose Spreadsheet')}
                        </Button>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '12px',
                            lineHeight: '16px',
                            color: 'text.secondary',
                            ml: 2
                          }}
                        >
                          {t(
                            'Select a spreadsheet from Google Drive to sync your data.'
                          )}
                        </Typography>
                      </Box>
                    )}
                    {values.googleMode === 'create' && (
                      <TextField
                        name="spreadsheetTitle"
                        value={values.spreadsheetTitle}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label={t('Sheet name')}
                        placeholder={t('Sheet name')}
                        inputProps={{ 'aria-label': t('Sheet title') }}
                        fullWidth
                        required
                        error={
                          errors.spreadsheetTitle != null &&
                          touched.spreadsheetTitle != null
                        }
                        helperText={
                          touched.spreadsheetTitle != null &&
                          errors.spreadsheetTitle != null
                            ? (errors.spreadsheetTitle )
                            : undefined
                        }
                      />
                    )}
                    <TextField
                      name="sheetName"
                      value={values.sheetName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label={t('Sheet tab name')}
                      placeholder={t('Sheet tab name')}
                      inputProps={{ 'aria-label': t('Sheet tab name') }}
                      fullWidth
                      required
                      error={
                        errors.sheetName != null && touched.sheetName != null
                      }
                      helperText={
                        touched.sheetName != null && errors.sheetName != null
                          ? (errors.sheetName )
                          : t('Data will sync in this tab.')
                      }
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}

