import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  ButtonAlignment,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'

import { Button } from '.'

describe('Button attributes', () => {
  const block: TreeBlock<ButtonBlock> = {
    id: 'button.id',
    __typename: 'ButtonBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    label: 'Button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: null,
    settings: {
      __typename: 'ButtonBlockSettings',
      alignment: ButtonAlignment.justify
    },
    children: []
  }

  it('shows default button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <Button {...block} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color Primary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Size Medium' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Variant Contained' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Leading Icon None' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Trailing Icon None' })
    ).toBeInTheDocument()
  })

  it('shows filled button', () => {
    const filledBlock: TreeBlock<ButtonBlock> = {
      ...block,
      buttonVariant: ButtonVariant.text,
      buttonColor: ButtonColor.secondary,
      size: ButtonSize.large,
      startIconId: 'icon1',
      endIconId: 'icon2',
      submitEnabled: null,
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'button.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      },
      children: [
        {
          id: 'icon1',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 0,
          iconName: IconName.ChatBubbleOutlineRounded,
          iconColor: IconColor.secondary,
          iconSize: IconSize.lg,
          children: []
        },
        {
          id: 'icon2',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 1,
          iconName: IconName.ChevronRightRounded,
          iconColor: IconColor.secondary,
          iconSize: IconSize.lg,
          children: []
        }
      ]
    }
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <Button {...filledBlock} />
          <TestEditorState />
        </EditorProvider>
      </MockedProvider>
    )
    expect(
      getByRole('button', { name: 'Action Selected Card' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color Secondary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Size Large' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Variant Text' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Leading Icon Chat Bubble' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Trailing Icon Chevron Right' })
    ).toBeInTheDocument()
  })

  it('should open accordion for action', () => {
    const { getByText } = render(
      <MockedProvider>
        <EditorProvider>
          <Button {...block} />
          <TestEditorState />
        </EditorProvider>
      </MockedProvider>
    )
    expect(
      getByText('selectedAttributeId: button.id-button-action')
    ).toBeInTheDocument()
  })
})
