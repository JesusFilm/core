import { gql, useMutation } from '@apollo/client'
import { Button, Stack, TextField } from '@mui/material'
import { useFormik } from 'formik'
import { FC } from 'react'
import * as yup from 'yup'
import { GET_NEXUSES } from '../../../pages'
import { Modal } from '../Modal'

interface CreateNexusModalProps {
  open: boolean
  onClose: () => void
}

const nexusValidationSchema = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required')
})

const NEXUS_CREATE = gql`
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

  const formik = useFormik({
    initialValues: {
      name: '',
      description: ''
    },
    validationSchema: nexusValidationSchema,
    onSubmit: (values) => {
      nexusCreate({
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
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={formik.submitForm}>Create</Button>
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
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
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
            formik.touched.description && Boolean(formik.errors.description)
          }
          helperText={formik.touched.description && formik.errors.description}
        />
      </Stack>
    </Modal>
  )
}
