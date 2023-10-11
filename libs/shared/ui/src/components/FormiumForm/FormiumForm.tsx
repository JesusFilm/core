import {
  FormiumForm as Formium,
  FormiumComponents,
  defaultComponents
} from '@formium/react'
import { Form } from '@formium/types'
import { FormikValues } from 'formik'
import { ReactElement, ReactNode, createContext, useContext } from 'react'

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

// Context
interface FormiumProviderContext {
  hiddenPageTitle?: boolean
  submitText?: string
  submitIcon?: ReactNode
}

const FormiumContext = createContext<FormiumProviderContext>({})

export function useFormium(): FormiumProviderContext {
  const context = useContext(FormiumContext)
  return context
}

// Formium Component
interface FormiumFormProps extends FormiumProviderContext {
  form: Form
  userId: string | null
  email: string | null
  handleClick: () => Promise<void>
}

export function FormiumForm({
  form,
  userId,
  email,
  hiddenPageTitle,
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
    <FormiumContext.Provider
      value={{ hiddenPageTitle, submitText, submitIcon }}
    >
      <Formium
        data={form}
        components={formiumComponents}
        onSubmit={handleSubmit}
      />
    </FormiumContext.Provider>
  )
}
