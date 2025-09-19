import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_SignUpBlock as SignUpBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { SignUp } from '.'

describe('SignUp Attributes', () => {
  const block: TreeBlock<SignUpBlock> = {
    id: 'signup.id',
    __typename: 'SignUpBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    submitLabel: 'Sign Up',
    action: {
      __typename: 'LinkAction',
      parentBlockId: 'signup.id',
      gtmEventName: 'signup',
      url: 'https://www.google.com',
      customizable: false,
      parentStepId: null
    },
    submitIconId: 'icon',
    children: [
      {
        id: 'icon',
        __typename: 'IconBlock',
        parentBlockId: 'button',
        parentOrder: 0,
        iconName: IconName.ArrowForwardRounded,
        iconColor: IconColor.action,
        iconSize: IconSize.lg,
        children: []
      }
    ]
  }

  it('shows default attributes', () => {
    const emptyBlock: TreeBlock<SignUpBlock> = {
      id: 'signup.id',
      __typename: 'SignUpBlock',
      parentBlockId: null,
      parentOrder: 0,
      submitLabel: null,
      action: null,
      submitIconId: null,
      children: []
    }

    const { getByRole } = render(
      <MockedProvider>
        <SignUp {...emptyBlock} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon None' })
    ).toBeInTheDocument()
  })

  it('shows filled attributes', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SignUp {...block} />
      </MockedProvider>
    )
    expect(
      getByRole('button', { name: 'Action URL/Website' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon Arrow Right' })
    ).toBeInTheDocument()
  })

  it('action accordion should be open', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <SignUp {...block} />
            <TestEditorState />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByText('selectedAttributeId: signup.id-signup-action')
    ).toBeInTheDocument()
  })

  it('button icon accordion should open when clicked', async () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider>
            <SignUp {...block} />
            <TestEditorState />
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByText('Button Icon'))
    expect(
      getByText('selectedAttributeId: signup.id-signup-icon')
    ).toBeInTheDocument()
  })
})
