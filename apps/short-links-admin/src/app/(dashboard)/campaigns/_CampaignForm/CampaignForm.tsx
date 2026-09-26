'use client'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { TagsInput } from '../../../../components/TagsInput'

export interface CampaignFormValues {
  name: string
  description: string
  /** yyyy-mm-dd or '' */
  startsAt: string
  endsAt: string
  tags: string[]
}

export const EMPTY_CAMPAIGN_FORM_VALUES: CampaignFormValues = {
  name: '',
  description: '',
  startsAt: '',
  endsAt: '',
  tags: []
}

interface CampaignFormProps {
  mode: 'create' | 'edit'
  initialValues: CampaignFormValues
  submitting: boolean
  errorMessage?: string
  onSubmit: (values: CampaignFormValues) => Promise<void> | void
  onCancel?: () => void
}

const schema = object({
  name: string().trim().required('Name is required'),
  endsAt: string().test(
    'after-start',
    'End date must be after the start date',
    function (value) {
      const start = this.parent.startsAt as string
      if (value == null || value === '' || start === '') return true
      return value >= start
    }
  )
})

export function CampaignForm({
  mode,
  initialValues,
  submitting,
  errorMessage,
  onSubmit,
  onCancel
}: CampaignFormProps): ReactElement {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue
      }) => (
        <Form noValidate>
          <Stack spacing={2}>
            {errorMessage != null && (
              <Alert severity="error">{errorMessage}</Alert>
            )}
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name === true && errors.name != null}
                    helperText={touched.name === true ? errors.name : undefined}
                    required
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    value={values.description}
                    onChange={handleChange}
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="startsAt"
                    name="startsAt"
                    label="Starts"
                    type="date"
                    value={values.startsAt}
                    onChange={handleChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="endsAt"
                    name="endsAt"
                    label="Ends"
                    type="date"
                    value={values.endsAt}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.endsAt === true && errors.endsAt != null}
                    helperText={
                      touched.endsAt === true ? errors.endsAt : undefined
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={12}>
                  <TagsInput
                    value={values.tags}
                    onChange={(tags) => void setFieldValue('tags', tags)}
                  />
                </Grid>
              </Grid>
            </Paper>
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'flex-end' }}
            >
              {onCancel != null && (
                <Button onClick={onCancel} disabled={submitting}>
                  Cancel
                </Button>
              )}
              <Button type="submit" variant="contained" loading={submitting}>
                {mode === 'create' ? 'Create campaign' : 'Save changes'}
              </Button>
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}
