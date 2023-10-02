import { FormElementType } from '@formium/client'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { sharedUiConfig } from '../../libs/sharedUiConfig'

import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { ElementsWrapper } from './ElementsWrapper'
import { FieldWrapper } from './FieldWrapper'
import { FooterWrapper } from './FooterWrapper'
import { FormControl } from './FormControl'
import { FormiumForm } from './FormiumForm'
import { Header } from './Header'
import { PageWrapper } from './PageWrapper'
import { RadioGroup } from './RadioGroup'
import { Textarea } from './Textarea'
import { TextInput } from './TextInput'

const FormiumFormStory: Meta<typeof FormiumForm> = {
  ...sharedUiConfig,
  component: FormiumForm,
  title: 'Shared-Ui/FormiumForm'
}

interface FormStoryProps {
  textInputProps: ComponentProps<typeof TextInput>
  textAreaProps: ComponentProps<typeof Textarea>
  checkboxProps: ComponentProps<typeof Checkbox>
  radioGroupProps: ComponentProps<typeof RadioGroup>
  headerProps: ComponentProps<typeof Header>
  formControlProps: ComponentProps<typeof FormControl>
  previousButtonProps: ComponentProps<typeof Button>
  nextButtonProps: ComponentProps<typeof Button>
  submitButtonProps: ComponentProps<typeof Button>
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
  } as unknown as ComponentProps<typeof RadioGroup>,
  headerProps: {
    page: {
      title: 'Page Title'
    }
  } as unknown as ComponentProps<typeof Header>,
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
            <FieldWrapper>
              <TextInput {...args.textInputProps} />
            </FieldWrapper>
            <FieldWrapper>
              <Textarea {...args.textAreaProps} />
            </FieldWrapper>
            <FieldWrapper>
              <Checkbox {...args.checkboxProps} />
            </FieldWrapper>
            <FieldWrapper>
              <RadioGroup {...args.radioGroupProps} />
            </FieldWrapper>
          </>
        </ElementsWrapper>
        <FooterWrapper>
          <>
            <Button {...args.previousButtonProps} />
            <Button {...args.submitButtonProps} />
            <Button {...args.nextButtonProps} />
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
