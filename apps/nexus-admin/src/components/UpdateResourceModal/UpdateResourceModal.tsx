import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useFormik } from 'formik'
import { useTranslation } from 'next-i18next'
import { FC, useEffect } from 'react'
import { object, string } from 'yup'

import { Resource_resource } from '../../../__generated__/Resource'
import { Modal } from '../Modal'

interface UpdateResourceModalProps {
  open: boolean
  onClose: () => void
  data: Partial<Resource_resource> | null
  onUpdate: (resourceData: Partial<Resource_resource>) => void
}

const resourceValidationSchema = object({
  name: string().required('Name is required')
})

export const UpdateResourceModal: FC<UpdateResourceModalProps> = ({
  open,
  onClose,
  data,
  onUpdate
}) => {
  const formik = useFormik({
    initialValues: {
      name: data?.name ?? ''
    },
    validationSchema: resourceValidationSchema,
    onSubmit: (values) => {
      onUpdate(values)
      formik.resetForm()
    }
  })
  const { t } = useTranslation()

  useEffect(() => {
    if (data !== undefined) {
      void formik.setValues({
        name: data?.name ?? ''
      })
    }
  }, [data])

  const closeModal = (): void => {
    onClose()
    formik.resetForm()
  }

  return (
    <Modal
      title="Update Resource"
      open={open}
      handleClose={closeModal}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={closeModal}>{t('Cancel')}</Button>
          <Button onClick={formik.submitForm}>{t('Update')}</Button>
        </Stack>
      }
    >
      <Stack spacing={4}>
        <TextField
          label="Name"
          variant="filled"
          id="name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.name) && Boolean(formik.errors.name)}
          helperText={Boolean(formik.touched.name) && formik.errors.name}
        />
      </Stack>
    </Modal>
  )
}
