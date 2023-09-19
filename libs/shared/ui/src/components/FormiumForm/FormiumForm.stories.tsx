import { FormElementType } from '@formium/client'
import { FormControlProps } from '@formium/react'
import {
  CheckboxProps,
  RadioGroupProps,
  TextInputProps,
  TextareaProps
} from '@formium/react/dist/inputs'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { sharedUiConfig } from '../../libs/sharedUiConfig'

import { Checkbox } from './Checkbox'
import { ElementsWrapper } from './ElementsWrapper'
import { FooterWrapper } from './FooterWrapper'
import { FormControl } from './FormControl'
import { FormiumForm } from './FormiumForm'
import { Header, HeaderProps } from './Header'
import { NextButton } from './NextButton'
import { PageWrapper } from './PageWrapper'
import { PreviousButton } from './PreviousButton'
import { RadioGroup } from './RadioGroup'
import { SubmitButton } from './SubmitButton'
import { Textarea } from './Textarea'
import { TextInput } from './TextInput'

const FormiumFormStory: Meta<typeof FormiumForm> = {
  ...sharedUiConfig,
  component: FormiumForm,
  title: 'Shared-Ui/FormiumForm'
}

interface FormStoryProps {
  textInputProps: TextInputProps
  textAreaProps: TextareaProps
  checkboxProps: CheckboxProps
  radioGroupProps: RadioGroupProps
  headerProps: HeaderProps
  formControlProps: FormControlProps
  previousButtonProps: JSX.IntrinsicElements['button']
  nextButtonProps: JSX.IntrinsicElements['button']
  submitButtonProps: JSX.IntrinsicElements['button']
}

const defaultFormStoryArgs: FormStoryProps = {
  textInputProps: {
    type: FormElementType.SHORT_TEXT as unknown as string,
    id: 'textInput.id',
    name: 'textInput.name',
    required: false,
    disabled: false,
    onChange: noop,
    onBlur: noop,
    onFocus: noop,
    value: 'Text Input Value',
    placeholder: 'Text Input Placeholder'
  },
  textAreaProps: {
    id: 'textArea.id',
    name: 'textArea.name',
    required: false,
    disabled: false,
    onChange: noop,
    onBlur: noop,
    onFocus: noop,
    value: 'Text Area Value',
    placeholder: 'Text Area Placeholder',
    rows: 5
  },
  checkboxProps: {
    id: 'checkbox.id',
    name: 'checkbox.name',
    disabled: false,
    checked: false,
    label: 'Checkbox Label',
    value: 'Checkbox Value',
    onChange: noop,
    onBlur: noop
  },
  radioGroupProps: {
    id: 'radioGroup.id',
    name: 'radioGroup.name',
    disabled: false,
    options: [
      {
        id: 'radioGroupOption1.id',
        label: 'Label 1',
        value: 'Value 1',
        disabled: false
      },
      {
        id: 'radioGroupOption2.id',
        label: 'Label 2',
        value: 'Value 2',
        disabled: false
      }
    ],
    onChange: noop,
    onBlur: noop
  } as unknown as RadioGroupProps,
  headerProps: {
    page: {
      title: 'Page Title'
    }
  } as unknown as HeaderProps,
  formControlProps: {
    label: 'Form Control Label',
    description: 'Form Control Description',
    error: 'Form Control Error',
    disabled: false,
    required: false
  },
  previousButtonProps: {
    type: 'button',
    onClick: noop,
    children: 'Previous Button'
  },
  nextButtonProps: {
    type: 'submit',
    onClick: noop,
    children: 'Next Button'
  },
  submitButtonProps: {
    type: 'submit',
    disabled: false,
    children: 'Submit Button'
  }
}

const Template: StoryObj<FormStoryProps> = {
  render: ({ ...args }) => (
    <PageWrapper>
      <>
        <Header {...args.headerProps} />
        <FormControl {...args.formControlProps} />
        <ElementsWrapper>
          <>
            <TextInput {...args.textInputProps} />
            <Textarea {...args.textAreaProps} />
            <Checkbox {...args.checkboxProps} />
            <RadioGroup {...args.radioGroupProps} />
          </>
        </ElementsWrapper>
        <FooterWrapper>
          <>
            <PreviousButton {...args.previousButtonProps} />
            <SubmitButton {...args.submitButtonProps} />
            <NextButton {...args.nextButtonProps} />
          </>
        </FooterWrapper>
      </>
    </PageWrapper>
  )
}

export const Default = {
  ...Template,
  args: { ...defaultFormStoryArgs }
}

export default FormiumFormStory
