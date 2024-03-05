import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useFormik } from 'formik'
import { FC, useEffect } from 'react'
import { object, string } from 'yup'

import { Channel_channel } from '../../../__generated__/Channel'
import { Modal } from '../Modal'

interface UpdateChannelModalProps {
  open: boolean
  onClose: () => void
  data: Partial<Channel_channel> | null
  onUpdate: (channelData: Partial<Channel_channel>) => void
}

const channelValidationSchema = object({
  name: string().required('Name is required'),
  platform: string().required('Platform is required')
})

export const UpdateChannelModal: FC<UpdateChannelModalProps> = ({
  open,
  onClose,
  data,
  onUpdate
}) => {
  const formik = useFormik({
    initialValues: {
      name: data?.name ?? '',
      platform: data?.platform ?? ''
    },
    validationSchema: channelValidationSchema,
    onSubmit: (values) => {
      onUpdate(values)
      formik.resetForm()
    }
  })

  useEffect(() => {
    if (data !== undefined) {
      void formik.setValues({
        name: data?.name ?? '',
        platform: data?.platform ?? ''
      })
    }
  }, [data])

  const closeModal = (): void => {
    onClose()
    formik.resetForm()
  }

  return (
    <Modal
      title="Update Channel"
      open={open}
      handleClose={closeModal}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={formik.submitForm}>Update</Button>
        </Stack>
      }
    >
      <Stack spacing={4}>
        <TextField
          label="Channel Name"
          variant="filled"
          id="name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.name) && Boolean(formik.errors.name)}
          helperText={Boolean(formik.touched.name) && formik.errors.name}
        />
        <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel>Platform Type</InputLabel>
          <Select
            id="name"
            name="platform"
            value={formik.values.platform}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              Boolean(formik.touched.platform) &&
              Boolean(formik.errors.platform)
            }
          >
            <MenuItem value="youtube">Youtube</MenuItem>
          </Select>
        </FormControl>
        {Boolean(formik.touched.platform) &&
          Boolean(formik.errors.platform) && (
            <FormHelperText error>{formik.errors.platform}</FormHelperText>
          )}
      </Stack>
    </Modal>
  )
}
