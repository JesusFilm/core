'use client'

import { Form, Formik } from 'formik'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { TextField, TextareaField } from '../../../../components/form'
import { TagsInput } from '../../../../components/TagsInput'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'

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
        <Form noValidate className="flex flex-col gap-4">
          {errorMessage != null && (
            <Alert variant="error">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <Card>
            <CardPanel className="flex flex-col gap-4">
              <TextField
                id="name"
                label="Name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name === true ? errors.name : undefined}
                required
              />
              <TextareaField
                id="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  id="startsAt"
                  label="Starts"
                  type="date"
                  value={values.startsAt}
                  onChange={handleChange}
                />
                <TextField
                  id="endsAt"
                  label="Ends"
                  type="date"
                  value={values.endsAt}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.endsAt === true ? errors.endsAt : undefined}
                />
              </div>
              <TagsInput
                value={values.tags}
                onChange={(tags) => void setFieldValue('tags', tags)}
              />
            </CardPanel>
          </Card>
          <div className="flex justify-end gap-2">
            {onCancel != null && (
              <Button variant="ghost" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={submitting}>
              {mode === 'create' ? 'Create campaign' : 'Save changes'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
