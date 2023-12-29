import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material'
import { useFormik } from 'formik'
import { FC } from 'react'
import { object, string } from 'yup'

import { Channel_channel } from '../../../__generated__/Channel'
import { Modal } from '../Modal'

interface CreateChannelModalProps {
  open: boolean
  onClose: () => void
  onCreate: (channelData: Partial<Channel_channel>) => void
}

const channelValidationSchema = object({
  name: string().required('Name is required'),
  platform: string().required('Platform is required')
})

export const CreateChannelModal: FC<CreateChannelModalProps> = ({
  open,
  onClose,
  onCreate
}) => {
  const formik = useFormik({
    initialValues: {
      name: '',
      platform: ''
    },
    validationSchema: channelValidationSchema,
    onSubmit: (values) => {
      onCreate(values)
      formik.resetForm()
    }
  })

  const closeModal = () => {
    onClose()
    formik.resetForm()
  }

  return (
    <Modal
      title="Create New Channel"
      open={open}
      handleClose={closeModal}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={formik.submitForm}>Create</Button>
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
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel>Platform Type</InputLabel>
          <Select
            id="name"
            name="platform"
            value={formik.values.platform}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.platform && Boolean(formik.errors.platform)}
          >
            <MenuItem value="youtube">Youtube</MenuItem>
          </Select>
        </FormControl>
        {formik.touched.platform && Boolean(formik.errors.platform) && (
          <FormHelperText error>{formik.errors.platform}</FormHelperText>
        )}
      </Stack>
    </Modal>
  )
}
