import { createClient } from '@formium/client'
import {
  FormiumForm as Formium,
  FormiumComponents,
  defaultComponents
} from '@formium/react'
import { Form } from '@formium/types'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { FormikValues } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

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
  userId?: string | null
  email?: string | null
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

  const { t } = useTranslation('libs-shared')

  return form != null && 'name' in form ? (
    <FormiumProvider {...props}>
      <Formium
        data={form}
        components={formiumComponents}
        onSubmit={handleSubmit}
      />
    </FormiumProvider>
  ) : (
    <Box
      sx={{
        minHeight: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Typography variant="h6" color="error">
        {t('Error Loading Form')}
      </Typography>
    </Box>
  )
}
