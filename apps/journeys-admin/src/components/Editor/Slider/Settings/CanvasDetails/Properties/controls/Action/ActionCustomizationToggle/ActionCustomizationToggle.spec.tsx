import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import { ContactActionType } from '../../../../../../../../../../__generated__/globalTypes'

import { ActionCustomizationToggle } from './ActionCustomizationToggle'

const mockAddAction = jest.fn()
jest.mock('../../../../../../../utils/useActionCommand', () => ({
  useActionCommand: () => ({ addAction: mockAddAction })
}))

describe('ActionCustomizationToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('renders toggle for LinkAction and reflects checked state', () => {
    const selectedBlock = {
      id: 'button-1',
      __typename: 'ButtonBlock',
      action: {
        __typename: 'LinkAction',
        url: 'https://example.com',
        customizable: true,
        parentStepId: 'step-1'
      }
    } as unknown as TreeBlock<ButtonBlock>
    const selectedStep = {
      id: 'step-1',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <ActionCustomizationToggle />
      </EditorProvider>
    )

    expect(screen.getByText('Needs Customization')).toBeInTheDocument()
    const toggle = screen.getByRole('checkbox', { name: 'Toggle customizable' })
    expect(toggle).toBeChecked()
  })

  it('renders toggle even when action is null', () => {
    const selectedBlock = {
      id: 'button-1',
      __typename: 'ButtonBlock',
      action: null
    } as unknown as TreeBlock<ButtonBlock>
    const selectedStep = {
      id: 'step-1',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <ActionCustomizationToggle />
      </EditorProvider>
    )
    expect(screen.getByText('Needs Customization')).toBeInTheDocument()
    const toggle = screen.getByRole('checkbox', { name: 'Toggle customizable' })
    expect(toggle).not.toBeChecked()
  })

  it('renders toggle for EmailAction and reflects unchecked state', () => {
    const selectedBlock = {
      id: 'button-2',
      __typename: 'ButtonBlock',
      action: {
        __typename: 'EmailAction',
        email: 'test@example.com',
        customizable: false,
        parentStepId: 'step-2'
      }
    } as unknown as TreeBlock<ButtonBlock>
    const selectedStep = {
      id: 'step-2',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <ActionCustomizationToggle />
      </EditorProvider>
    )

    expect(screen.getByText('Needs Customization')).toBeInTheDocument()
    const toggle = screen.getByRole('checkbox', { name: 'Toggle customizable' })
    expect(toggle).not.toBeChecked()
  })

  it('dispatches addAction on LinkAction toggle change', () => {
    const addAction = jest.fn()
    jest
      .spyOn(
        require('../../../../../../../utils/useActionCommand'),
        'useActionCommand'
      )
      .mockReturnValue({ addAction })

    const selectedBlock = {
      id: 'button-3',
      __typename: 'ButtonBlock',
      action: {
        __typename: 'LinkAction',
        url: 'https://example.com',
        customizable: false,
        parentStepId: 'step-3'
      }
    } as unknown as TreeBlock<ButtonBlock>
    const selectedStep = {
      id: 'step-3',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <ActionCustomizationToggle />
      </EditorProvider>
    )

    const toggle = screen.getByRole('checkbox', { name: 'Toggle customizable' })
    fireEvent.click(toggle)

    expect(addAction).toHaveBeenCalledWith(
      expect.objectContaining({
        blockId: 'button-3',
        action: expect.objectContaining({
          __typename: 'LinkAction',
          url: 'https://example.com',
          customizable: true,
          parentStepId: 'step-3'
        })
      })
    )
  })

  it('dispatches addAction on EmailAction toggle change', () => {
    const addAction = jest.fn()
    jest
      .spyOn(
        require('../../../../../../../utils/useActionCommand'),
        'useActionCommand'
      )
      .mockReturnValue({ addAction })

    const selectedBlock = {
      id: 'button-4',
      __typename: 'ButtonBlock',
      action: {
        __typename: 'EmailAction',
        email: 'test@example.com',
        customizable: false,
        parentStepId: 'step-4'
      }
    } as unknown as TreeBlock<ButtonBlock>
    const selectedStep = {
      id: 'step-4',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <ActionCustomizationToggle />
      </EditorProvider>
    )

    const toggle = screen.getByRole('checkbox', { name: 'Toggle customizable' })
    fireEvent.click(toggle)

    expect(addAction).toHaveBeenCalledWith(
      expect.objectContaining({
        blockId: 'button-4',
        action: expect.objectContaining({
          __typename: 'EmailAction',
          email: 'test@example.com',
          customizable: true,
          parentStepId: 'step-4'
        })
      })
    )
  })

  it('renders toggle for PhoneAction and reflects checked state', () => {
    const selectedBlock = {
      id: 'button-5',
      __typename: 'ButtonBlock',
      action: {
        __typename: 'PhoneAction',
        parentBlockId: 'button-5',
        gtmEventName: '',
        phone: '+1234567890',
        countryCode: 'US',
        contactAction: ContactActionType.call,
        customizable: true
      }
    } as unknown as TreeBlock<ButtonBlock>

    const selectedStep = {
      id: 'step-5',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <ActionCustomizationToggle />
      </EditorProvider>
    )

    const toggle = screen.getByRole('checkbox', { name: 'Toggle customizable' })
    expect(toggle).toBeChecked()
  })

  it('renders toggle for ChatAction and reflects checked state', () => {
    const selectedBlock = {
      id: 'button-5',
      __typename: 'ButtonBlock',
      action: {
        __typename: 'ChatAction',
        chatUrl: 'https://chat.example.com',
        customizable: true,
        parentStepId: 'step-5'
      }
    } as unknown as TreeBlock<ButtonBlock>
    const selectedStep = {
      id: 'step-5',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: false,
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <ActionCustomizationToggle />
      </EditorProvider>
    )

    expect(screen.getByText('Needs Customization')).toBeInTheDocument()
    const toggle = screen.getByRole('checkbox', {
      name: 'Toggle customizable'
    })
    expect(toggle).toBeChecked()
  })

  it('handles toggle change for PhoneAction', () => {
    const selectedBlock = {
      id: 'button-6',
      __typename: 'ButtonBlock',
      action: {
        __typename: 'PhoneAction',
        parentBlockId: 'button-6',
        gtmEventName: '',
        phone: '+1234567890',
        countryCode: 'US',
        contactAction: ContactActionType.call,
        customizable: false,
        parentStepId: 'step-6'
      }
    } as unknown as TreeBlock<ButtonBlock>

    const selectedStep = {
      id: 'step-6',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <ActionCustomizationToggle />
      </EditorProvider>
    )

    const toggle = screen.getByRole('checkbox', {
      name: 'Toggle customizable'
    })
    fireEvent.click(toggle)
    expect(mockAddAction).toHaveBeenCalledWith(
      expect.objectContaining({
        blockId: 'button-6',
        action: expect.objectContaining({
          __typename: 'PhoneAction',
          phone: '+1234567890',
          countryCode: 'US',
          contactAction: ContactActionType.call,
          customizable: true,
          parentStepId: 'step-6'
        })
      })
    )
  })

  it('renders toggle for ChatAction and reflects unchecked state', () => {
    const selectedBlock = {
      id: 'button-6',
      __typename: 'ButtonBlock',
      action: {
        __typename: 'ChatAction',
        chatUrl: 'https://chat.example.com',
        customizable: false,
        parentStepId: 'step-6'
      }
    } as unknown as TreeBlock<ButtonBlock>

    const selectedStep = {
      id: 'step-6',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: false,
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <ActionCustomizationToggle />
      </EditorProvider>
    )

    expect(screen.getByText('Needs Customization')).toBeInTheDocument()
    const toggle = screen.getByRole('checkbox', {
      name: 'Toggle customizable'
    })
    expect(toggle).not.toBeChecked()
  })

  it('dispatches addAction on ChatAction toggle change', () => {
    const addAction = jest.fn()
    jest
      .spyOn(
        require('../../../../../../../utils/useActionCommand'),
        'useActionCommand'
      )
      .mockReturnValue({ addAction })

    const selectedBlock = {
      id: 'button-7',
      __typename: 'ButtonBlock',
      action: {
        __typename: 'ChatAction',
        chatUrl: 'https://chat.example.com',
        customizable: false,
        parentStepId: 'step-7'
      }
    } as unknown as TreeBlock<ButtonBlock>
    const selectedStep = {
      id: 'step-7',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: false,
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <ActionCustomizationToggle />
      </EditorProvider>
    )

    const toggle = screen.getByRole('checkbox', {
      name: 'Toggle customizable'
    })
    fireEvent.click(toggle)

    expect(addAction).toHaveBeenCalledWith(
      expect.objectContaining({
        blockId: 'button-7',
        action: expect.objectContaining({
          __typename: 'ChatAction',
          chatUrl: 'https://chat.example.com',
          customizable: true,
          parentStepId: 'step-7'
        })
      })
    )
  })
})
