import {
  FormiumForm as Formium,
  FormiumComponents,
  defaultComponents
} from '@formium/react'
import { Form } from '@formium/types'
import { ReactElement } from 'react'

import { formiumClient } from '../../libs/formiumClient'

import { Checkbox } from './Checkbox'
import { ElementsWrapper } from './ElementsWrapper'
import { FooterWrapper } from './FooterWrapper'
import { FormControl } from './FormControl'
import { Header } from './Header'
import { NextButton } from './NextButton'
import { PageWrapper } from './PageWrapper'
import { PreviousButton } from './PreviousButton'
import { RadioGroup } from './RadioGroup'
import { SubmitButton } from './SubmitButton'
import { Textarea } from './Textarea'
import { TextInput } from './TextInput'

// declared outside of the component to save on rerenders
const myComponents: FormiumComponents = {
  ...defaultComponents,
  TextInput,
  Textarea,
  Checkbox,
  RadioGroup,
  FormControl,
  ElementsWrapper,
  PageWrapper,
  FooterWrapper,
  Header,
  SubmitButton,
  NextButton,
  PreviousButton
}

interface FormiumFormProps {
  form: Form
}

export function FormiumForm({ form }: FormiumFormProps): ReactElement {
  return (
    <Formium
      data={form}
      components={myComponents}
      onSubmit={async (values) => {
        await formiumClient.submitForm('ns-test', values)
      }}
    />
  )
}
