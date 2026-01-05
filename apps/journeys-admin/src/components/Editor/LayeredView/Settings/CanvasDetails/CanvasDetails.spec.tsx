import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../__generated__/globalTypes'

import { CanvasDetails } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => false)
}))

describe('CanvasDetails', () => {
  const mockButtonBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'ButtonBlock.id',
    parentBlockId: 'CardBlock.id',
    parentOrder: 0,
    label: 'Click Me',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.medium,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: null,
    children: [],
    settings: null
  }

  const mockStep: TreeBlock<StepBlock> = {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: [mockButtonBlock],
    slug: null
  }

  it('should render add block', () => {
    render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock
          }}
        >
          <CanvasDetails />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Add a block')).toBeInTheDocument()
  })

  it('should render JourneyAppearance', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              activeCanvasDetailsDrawer:
                ActiveCanvasDetailsDrawer.JourneyAppearance
            }}
          >
            <CanvasDetails />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Journey Appearance')).toBeInTheDocument()
  })

  it('should render properties', () => {
    render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
            selectedStep: mockStep,
            selectedBlock: mockButtonBlock
          }}
        >
          <CanvasDetails />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Button Properties')).toBeInTheDocument()
  })
})
