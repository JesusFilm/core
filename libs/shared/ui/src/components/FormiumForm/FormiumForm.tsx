import {
  FormiumForm as Formium,
  FormiumComponents,
  defaultComponents
} from '@formium/react'
import { Form } from '@formium/types'
import { FormikValues } from 'formik'
import { ReactElement, ReactNode } from 'react'

import { formiumClient } from '../../libs/formiumClient'

import { Checkbox } from './Checkbox'
import { ElementsWrapper } from './ElementsWrapper'
import { FieldWrapper } from './FieldWrapper'
import { FooterWrapper } from './FooterWrapper'
import { FormControl } from './FormControl'
import { FormiumProvider } from './FormiumProvider'
import { Header } from './Header'
import { NextButton } from './NextButton'
import { PageWrapper } from './PageWrapper'
import { PreviousButton } from './PreviousButton'
import { RadioGroup } from './RadioGroup'
import { SubmitButton } from './SubmitButton'
import { Textarea } from './Textarea'
import { TextInput } from './TextInput'

// declared outside of the component to save on rerenders
const formiumComponents: FormiumComponents = {
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
  FieldWrapper,
  SubmitButton,
  NextButton,
  PreviousButton
}

interface FormiumFormProps {
  form: Form
  userId: string | null
  email: string | null
  submitText?: string
  submitIcon?: ReactNode
  handleClick: () => Promise<void>
}

export function FormiumForm({
  form,
  userId,
  email,
  submitText,
  submitIcon,
  handleClick
}: FormiumFormProps): ReactElement {
  async function handleSubmit(values: FormikValues): Promise<void> {
    await formiumClient.submitForm(form.slug, {
      ...values,
      hiddenUserId: userId,
      hiddenUserEmail: email
    })
    await handleClick()
  }

  return (
    <FormiumProvider value={{ submitText, submitIcon }}>
      <Formium
        data={form}
        components={formiumComponents}
        onSubmit={handleSubmit}
      />
    </FormiumProvider>
  )
}
