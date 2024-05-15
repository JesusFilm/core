import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ActionButton } from './ActionButton'
import { JourneyProvider, useJourney } from '@core/journeys/ui/JourneyProvider'
import { useNavigateToBlockActionUpdateMutation } from '../../../../../../../libs/useNavigateToBlockActionUpdateMutation'
import { JourneyFields as Journey } from '../../../../../../../../../../libs/journeys/ui/src/libs/JourneyProvider/__generated__/JourneyFields'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import {
  NavigateToBlockActionUpdate,
  NavigateToBlockActionUpdateVariables
} from '../../../../../../../../__generated__/NavigateToBlockActionUpdate'
import {
  BlockFields as Block,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import { NAVIGATE_TO_BLOCK_ACTION_UPDATE } from '../../../../../../../libs/useNavigateToBlockActionUpdateMutation/useNavigateToBlockActionUpdateMutation'
import { TreeBlock } from '@core/journeys/ui/block'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../__generated__/globalTypes'

const mockBlock: TreeBlock<Block> = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  parentOrder: 0,
  label: 'This is a button',
  buttonVariant: ButtonVariant.contained,
  buttonColor: ButtonColor.primary,
  size: ButtonSize.small,
  startIconId: null,
  endIconId: null,
  action: null,
  children: []
}

const mockStep: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  children: [
    {
      __typename: 'CardBlock',
      id: 'card.id',
      parentBlockId: null,
      parentOrder: null,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [
        {
          __typename: 'TypographyBlock',
          id: 'typog.id',
          content: 'stepName',
          parentBlockId: null,
          align: null,
          color: null,
          variant: null,
          parentOrder: 0,
          children: []
        }
      ]
    }
  ]
}

const result = jest.fn()
const mockNavigateToBlockActionUpdate: MockedResponse<
  NavigateToBlockActionUpdate,
  NavigateToBlockActionUpdateVariables
> = {
  request: {
    query: NAVIGATE_TO_BLOCK_ACTION_UPDATE,
    variables: {
      id: mockBlock.id,
      journeyId: 'journey.id',
      input: { blockId: 'targetBlockId' }
    }
  },
  result
}

describe('ActionButton', () => {
  it('renders button with correct title', () => {
    render(
      <MockedProvider mocks={[mockNavigateToBlockActionUpdate]}>
        <JourneyProvider>
          <ActionButton block={mockBlock} step={mockStep} />
        </JourneyProvider>
      </MockedProvider>
    )

    const button = screen.getByRole('button', { name: /This is a button/i })
    expect(button).toBeInTheDocument()
  })

  it('executes handleSourceConnect when clicked', async () => {
    render(
      <MockedProvider mocks={[mockNavigateToBlockActionUpdate]}>
        <JourneyProvider>
          <ActionButton block={mockBlock} step={mockStep} />
        </JourneyProvider>
      </MockedProvider>
    )

    const button = screen.getByRole('button', { name: /This is a button/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockNavigateToBlockActionUpdate).toHaveBeenCalledWith(
        mockBlock,
        'target'
      )
    })
  })
})
