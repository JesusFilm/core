import { Button, Stack, TextField } from '@mui/material'
import { useFormik } from 'formik'
import { FC, useEffect } from 'react'
import * as yup from 'yup'
import { Resource } from '../../../pages/resources'
import { Modal } from '../Modal'

interface UpdateResourceModalProps {
  open: boolean
  onClose: () => void
  data: Partial<Resource> | null
  onUpdate: (resourceData: Partial<Resource>) => void
}

const resourceValidationSchema = yup.object({
  name: yup.string().required('Name is required'),
  videoId: yup.string().required('Video ID is required')
})

export const UpdateResourceModal: FC<UpdateResourceModalProps> = ({
  open,
  onClose,
  data,
  onUpdate
}) => {
  const formik = useFormik({
    initialValues: {
      name: data?.name ?? '',
      videoId: data?.videoId ?? ''
    },
    validationSchema: resourceValidationSchema,
    onSubmit: (values) => {
      onUpdate(values)
    }
  })

  useEffect(() => {
    if (data) {
      formik.setValues({
        name: data?.name ?? '',
        videoId: data?.videoId ?? ''
      })
    }
  }, [data])

  return (
    <Modal
      title="Update Resource"
      open={open}
      handleClose={onClose}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={formik.submitForm}>Update</Button>
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
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          label="Video ID"
          variant="filled"
          id="videoId"
          name="videoId"
          value={formik.values.videoId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.videoId && Boolean(formik.errors.videoId)}
          helperText={formik.touched.videoId && formik.errors.videoId}
        />
      </Stack>
    </Modal>
  )
}
