import {
  FormiumComponents,
  FormiumForm,
  defaultComponents
} from '@formium/react'
import { TextInputProps } from '@formium/react/dist/inputs'
import { Form } from '@formium/types'
import Stack from '@mui/material/Stack'
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

const myComponents: FormiumComponents = {
  ...defaultComponents,
  TextInput
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
