import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { journeyUiConfig } from '../../libs/journeyUiConfig'

import { TranslationDialogWrapper } from './TranslationDialogWrapper'

const TranslationDialogWrapperStory: Meta<typeof TranslationDialogWrapper> = {
  ...journeyUiConfig,
  component: TranslationDialogWrapper,
  title: 'Journeys-Ui/TranslationDialogWrapper',
  parameters: {
    theme: 'light',
    docs: {
      disable: true
    }
  }
}

const Template: StoryObj<typeof TranslationDialogWrapper> = {
  render: ({ ...args }) => {
    return <TranslationDialogWrapper {...args} />
  }
}

export const Default = {
  ...Template,
  args: {
    open: true,
    divider: false,
    onClose: noop,
    onTranslate: noop,
    title: 'Translate Journey',
    loading: false,
    children: <Typography>Translation dialog content</Typography>
  }
}

export const Loading = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    onTranslate: noop,
    title: 'Translate Journey',
    loading: true,
    loadingText: 'Translating your journey...',
    children: <Typography>Translation dialog content</Typography>,
    divider: false,
    isTranslation: true
  }
}

export const WithCustomSubmitLabel = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    onTranslate: noop,
    title: 'Copy Journey',
    loading: false,
    submitLabel: 'Copy',
    divider: false,
    children: <Typography>Custom submit label content</Typography>
  }
}

export const WithDivider = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    onTranslate: noop,
    title: 'Translation with Divider',
    loading: false,
    children: <Typography>Content with divider</Typography>
  }
}

export default TranslationDialogWrapperStory
