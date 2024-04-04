import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useFormik } from 'formik'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'
import { object, string } from 'yup'

import { GET_NEXUSES } from '../../../pages'
import { Modal } from '../Modal'

interface CreateNexusModalProps {
  open: boolean
  onClose: () => void
}

const nexusValidationSchema = object({
  name: string().required('Name is required'),
  description: string().required('Description is required')
})

export const NEXUS_CREATE = gql`
  mutation NexusCreate($input: NexusCreateInput!) {
    nexusCreate(input: $input) {
      id
      name
      description
    }
  }
`

export const CreateNexusModal: FC<CreateNexusModalProps> = ({
  open,
  onClose
}) => {
  const [nexusCreate] = useMutation(NEXUS_CREATE)
  const { t } = useTranslation()

  const formik = useFormik({
    initialValues: {
      name: '',
      description: ''
    },
    validationSchema: nexusValidationSchema,
    onSubmit: (values) => {
      void nexusCreate({
        variables: {
          input: values
        },
        onCompleted: () => {
          onClose()
        },
        refetchQueries: [GET_NEXUSES]
      })
    }
  })

  return (
    <Modal
      title="Create Nexus App"
      open={open}
      handleClose={onClose}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={onClose}>{t('Cancel')}</Button>
          <Button onClick={formik.submitForm}>{t('Create')}</Button>
        </Stack>
      }
    >
      <Stack spacing={4} component="form" onSubmit={formik.handleSubmit}>
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
        <TextField
          label="Description"
          variant="filled"
          id="name"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            Boolean(formik.touched.description) &&
            Boolean(formik.errors.description)
          }
          helperText={
            Boolean(formik.touched.description) && formik.errors.description
          }
        />
      </Stack>
    </Modal>
  )
}
