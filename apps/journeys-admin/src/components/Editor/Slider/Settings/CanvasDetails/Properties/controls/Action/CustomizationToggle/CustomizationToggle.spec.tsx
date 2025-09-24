import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../../../__generated__/BlockFields'

import { CustomizationToggle } from './CustomizationToggle'

jest.mock('../../../../../../../utils/useActionCommand', () => ({
  useActionCommand: () => ({ addAction: jest.fn() })
}))

describe('CustomizationToggle', () => {
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
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <CustomizationToggle />
      </EditorProvider>
    )

    expect(screen.getByText('Needs Customization')).toBeInTheDocument()
    const toggle = screen.getByRole('checkbox', { name: 'Toggle customizable' })
    expect(toggle).toBeChecked()
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
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <CustomizationToggle />
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
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <CustomizationToggle />
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
      slug: 'slug'
    } as unknown as TreeBlock<StepBlock>

    render(
      <EditorProvider initialState={{ selectedBlock, selectedStep }}>
        <CustomizationToggle />
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
})
