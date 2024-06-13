import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useFormik } from 'formik'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'
import { object, string } from 'yup'

import { Channels_channels } from '../../../__generated__/Channels'
import { Modal } from '../Modal'

interface CreateChannelModalProps {
  open: boolean
  onClose: () => void
  onCreate: (channelData: Partial<Channels_channels>) => void
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
  const { t } = useTranslation()

  const closeModal = (): void => {
    onClose()
    formik.resetForm()
  }

  return (
    <Modal
      title="Connect Channel"
      open={open}
      handleClose={closeModal}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={closeModal}>{t('Cancel')}</Button>
          <Button variant="contained" onClick={formik.submitForm}>
            {t('Connect')}
          </Button>
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
          <InputLabel>{t('Platform Type')}</InputLabel>
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
            <MenuItem value="youtube">{t('Youtube')}</MenuItem>
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
