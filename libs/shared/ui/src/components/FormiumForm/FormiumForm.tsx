import {
  FormiumForm as Formium,
  FormiumComponents,
  defaultComponents
} from '@formium/react'
import { Form } from '@formium/types'
import { FormikValues } from 'formik'
import { ReactElement } from 'react'

import { formiumClient } from '../../libs/formiumClient'

import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { ElementsWrapper } from './ElementsWrapper'
import { FooterWrapper } from './FooterWrapper'
import { FormControl } from './FormControl'
import { Header } from './Header'
import { PageWrapper } from './PageWrapper'
import { RadioGroup } from './RadioGroup'
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
  SubmitButton: Button,
  NextButton: Button,
  PreviousButton: Button
}

interface FormiumFormProps {
  form: Form
}

export function FormiumForm({ form }: FormiumFormProps): ReactElement {
  async function handleSubmit(values: FormikValues): Promise<void> {
    await formiumClient.submitForm(form.slug, values)
  }

  return (
    <Formium data={form} components={myComponents} onSubmit={handleSubmit} />
  )
}
