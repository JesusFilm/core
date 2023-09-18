import { FormiumClient } from '@formium/client'
import {
  FormControlProps,
  FormiumForm as Formium,
  FormiumComponents,
  defaultComponents
} from '@formium/react'
import { TextInputProps } from '@formium/react/dist/inputs'
import { Form } from '@formium/types'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

function TextInput(props: TextInputProps): ReactElement {
  return <TextField label="Outlined" variant="outlined" {...props} />
}

function FormControl({
  children,
  description,
  error,
  label,
  labelFor
}: FormControlProps): ReactElement {
  return (
    <div>
      {/* {label && <label htmlFor={labelFor}>{label}</label>} */}
      {/* {description && <div>{description}</div>} */}
      {children}
      {/* {error && <div>{error}</div>} */}
    </div>
  )
}

const myComponents: FormiumComponents = {
  ...defaultComponents,
  TextInput,
  FormControl
}

interface Props {
  formiumClient: FormiumClient
  form: Form
  userId: string | undefined
}

export function FormiumForm({
  formiumClient,
  form,
  userId
}: Props): ReactElement {
  return (
    <Formium
      data={form}
      components={myComponents}
      onSubmit={async (values) => {
        await formiumClient.submitForm('ns-test', values)
        alert('Success')
      }}
    />
  )
}
