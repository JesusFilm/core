import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { SnackbarProvider } from 'notistack'
import { ComponentProps, ReactElement } from 'react'

import {
  IconName,
  TextResponseType,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { StoryCard } from '../StoryCard'
import { Typography } from '../Typography'

import {
  TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
  TextResponse
} from './TextResponse'

const Demo: Meta<typeof TextResponse> = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: TextResponse,
  title: 'Journeys-Ui/TextResponse',
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

const typographyProps: ComponentProps<typeof Typography> = {
  __typename: 'TypographyBlock',
  id: 'id',
  parentOrder: 0,
  parentBlockId: 'card',
  align: null,
  color: null,
  variant: TypographyVariant.h3,
  content: 'Some block above',
  children: [],
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

const textResponseProps: ComponentProps<typeof TextResponse> = {
  id: 'textResponseBlockId1',
  __typename: 'TextResponseBlock',
  parentBlockId: null,
  parentOrder: 0,
  label: 'Your answer here',
  placeholder: null,
  hint: null,
  minRows: null,
  integrationId: null,
  required: null,
  type: null,
  routeId: null,
  children: []
}

const submitEventMock: MockedResponse = {
  request: {
    query: TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId: 'textResponseBlockId1',
        value: 'My response'
      }
    }
  },
  result: {
    data: {
      textResponseSubmissionEventCreate: {
        id: 'uuid'
      }
    }
  }
}

const Template: StoryObj<typeof TextResponse> = {
  render: ({ ...args }): ReactElement => (
    <MockedProvider mocks={[submitEventMock]}>
      <JourneyProvider>
        <SnackbarProvider>
          <StoryCard>
            <Typography {...typographyProps} />
            <TextResponse {...args} />
            <Typography
              {...typographyProps}
              content="Some block below"
              variant={TypographyVariant.body1}
            />
          </StoryCard>
        </SnackbarProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = { ...Template, args: { ...textResponseProps } }

export const Complete = {
  ...Template,
  args: {
    ...Default.args,
    hint: t('Optional Hint text'),
    minRows: 4,
    label: t('Custom label'),
    placeholder: t('Placeholder text'),
    submitIconId: 'icon',
    submitLabel: t('Custom label'),
    children: [
      {
        id: 'icon',
        __typename: 'IconBlock',
        parentBlockId: 'parent',
        parentOrder: 0,
        iconName: IconName.SendRounded,
        iconSize: null,
        iconColor: null,
        children: []
      }
    ]
  }
}

export const Required = {
  ...Template,
  args: {
    ...Default.args,
    hint: t('Optional Hint text'),
    minRows: 4,
    label: t('Custom label'),
    placeholder: t('Placeholder text'),
    submitIconId: 'icon',
    submitLabel: t('Custom label'),
    required: true,
    children: [
      {
        id: 'icon',
        __typename: 'IconBlock',
        parentBlockId: 'parent',
        parentOrder: 0,
        iconName: IconName.SendRounded,
        iconSize: null,
        iconColor: null,
        children: []
      }
    ]
  }
}

export const RequiredValidation = {
  ...Template,
  args: {
    ...Default.args,
    hint: t('Optional Hint text'),
    minRows: 4,
    label: 'Custom label',
    placeholder: t('Placeholder text'),
    submitIconId: 'icon',
    submitLabel: t('Custom label'),
    required: true,
    children: [
      {
        id: 'icon',
        __typename: 'IconBlock',
        parentBlockId: 'parent',
        parentOrder: 0,
        iconName: IconName.SendRounded,
        iconSize: null,
        iconColor: null,
        children: []
      }
    ]
  },
  play: async () => {
    await userEvent.click(screen.getAllByRole('textbox')[0])
    await userEvent.click(screen.getAllByText('Some block below')[0])
    await userEvent.click(screen.getAllByRole('textbox')[1])
    await userEvent.click(screen.getAllByText('Some block below')[1])
  }
}

export const EmailValidation = {
  ...Template,
  args: {
    ...Default.args,
    hint: t('Optional Hint text'),
    minRows: 4,
    label: t('Custom label'),
    placeholder: t('Placeholder text'),
    submitIconId: 'icon',
    submitLabel: t('Custom label'),
    required: true,
    type: TextResponseType.email,
    children: [
      {
        id: 'icon',
        __typename: 'IconBlock',
        parentBlockId: 'parent',
        parentOrder: 0,
        iconName: IconName.SendRounded,
        iconSize: null,
        iconColor: null,
        children: []
      }
    ]
  },
  play: async () => {
    await userEvent.type(screen.getAllByRole('textbox')[0], 'Answer')
    await userEvent.click(screen.getAllByText('Some block below')[0])
    await userEvent.type(screen.getAllByRole('textbox')[1], 'Answer')
    await userEvent.click(screen.getAllByText('Some block below')[1])
  }
}

export const SubmitError = {
  ...Template,
  args: {
    ...Default.args,
    minRows: 1
  },
  play: async () => {
    await userEvent.type(screen.getAllByRole('textbox')[0], 'Answer')
    await userEvent.click(screen.getAllByText('Some block below')[0])
  }
}

const LoadingTemplate: StoryObj<typeof TextResponse> = {
  render: ({ ...args }): ReactElement => (
    <ApolloLoadingProvider>
      <JourneyProvider>
        <SnackbarProvider>
          <StoryCard>
            <TextResponse {...args} />
          </StoryCard>
        </SnackbarProvider>
      </JourneyProvider>
    </ApolloLoadingProvider>
  )
}

export const Loading = {
  ...LoadingTemplate,
  args: { ...Default.args },
  parameters: { chromatic: { disableSnapshot: true } },
  play: async () => {
    const submitButtons = screen.getAllByRole('button')
    const textFields = screen.getAllByRole('textbox')
    await Promise.all(
      textFields.map(async (field) => {
        await userEvent.type(field, 'Answer')
      })
    )
    await Promise.all(
      submitButtons.map(async (button) => {
        await userEvent.click(button)
      })
    )
  }
}

export const RTL = {
  ...Template,
  args: { ...Complete.args },
  parameters: { rtl: true }
}

export default Demo
