import {
  FormControlProps,
  FormiumComponents,
  FormiumForm,
  defaultComponents
} from '@formium/react'
import { TextInputProps } from '@formium/react/dist/inputs'
import { Form } from '@formium/types'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

import { formium } from '../../../lib/formium'

interface Props {
  form: Form
}

function TextInput(props: TextInputProps): ReactElement {
  // console.log(props)
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
  // PageWrapper,
  // ElementsWrapper,
  // FieldWrapper
}

export function AATestForm({ form }: Props): ReactElement {
  console.log(form)
  return (
    <FormiumForm
      data={form}
      components={myComponents}
      onSubmit={async (values) => {
        await formium.submitForm('ns-test', values)
        alert('Success')
      }}
    />
  )
}
