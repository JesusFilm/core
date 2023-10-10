import {
  FormiumForm as Formium,
  FormiumComponents,
  defaultComponents
} from '@formium/react'
import { Form } from '@formium/types'
import { FormikValues } from 'formik'
import { ReactElement, ReactNode } from 'react'

import { formiumClient } from '../../libs/formiumClient'

import { Checkbox } from './formComponents/Checkbox'
import { FormControl } from './formComponents/FormControl'
import { Header } from './formComponents/Header'
import { NextButton } from './formComponents/NextButton'
import { PreviousButton } from './formComponents/PreviousButton'
import { RadioGroup } from './formComponents/RadioGroup'
import { SubmitButton } from './formComponents/SubmitButton'
import { Textarea } from './formComponents/Textarea'
import { TextInput } from './formComponents/TextInput'
import { FormiumProvider } from './FormiumProvider'
import { ElementsWrapper } from './wrappers/ElementsWrapper'
import { FieldWrapper } from './wrappers/FieldWrapper'
import { FooterWrapper } from './wrappers/FooterWrapper'
import { PageWrapper } from './wrappers/PageWrapper'

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
  formSubtitle?: string
  submitText?: string
  submitIcon?: ReactNode
  handleClick: () => Promise<void>
}

export function FormiumForm({
  form,
  userId,
  email,
  formSubtitle,
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
    <FormiumProvider value={{ formSubtitle, submitText, submitIcon }}>
      <Formium
        data={form}
        components={formiumComponents}
        onSubmit={handleSubmit}
      />
    </FormiumProvider>
  )
}
