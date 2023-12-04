import { createClient } from '@formium/client'
import {
  FormiumForm as Formium,
  FormiumComponents,
  defaultComponents
} from '@formium/react'
import { Form } from '@formium/types'
import { FormikValues } from 'formik'
import { ReactElement } from 'react'

import { Checkbox } from './formComponents/Checkbox'
import { FormControl } from './formComponents/FormControl'
import { Header } from './formComponents/Header'
import { NextButton } from './formComponents/NextButton'
import { PreviousButton } from './formComponents/PreviousButton'
import { RadioGroup } from './formComponents/RadioGroup'
import { SubmitButton } from './formComponents/SubmitButton'
import { Textarea } from './formComponents/Textarea'
import { TextInput } from './formComponents/TextInput'
import { FormiumProvider, FormiumProviderContext } from './FormiumProvider'
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

// Formium Component
interface FormiumFormProps extends FormiumProviderContext {
  form: Form | null
  userId: string | null
  email: string | null
  onSubmit?: () => void
}

export function FormiumForm({
  form,
  userId,
  email,
  onSubmit,
  ...props
}: FormiumFormProps): ReactElement {
  async function handleSubmit(values: FormikValues): Promise<void> {
    if (form == null) return
    await createClient(form.projectId).submitForm(form.slug, {
      ...values,
      hiddenUserId: userId,
      hiddenUserEmail: email
    })
    onSubmit?.()
  }

  return form != null ? (
    <FormiumProvider {...props}>
      <Formium
        data={form}
        components={formiumComponents}
        onSubmit={handleSubmit}
      />
    </FormiumProvider>
  ) : (
    <></>
  )
}
