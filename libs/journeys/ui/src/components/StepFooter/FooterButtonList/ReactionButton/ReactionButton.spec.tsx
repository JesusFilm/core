import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'

import { TreeBlock, blockHistoryVar } from '../../../../libs/block'
import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { keyify } from '../../../../libs/plausibleHelpers'
import { StepFields } from '../../../Step/__generated__/StepFields'

import { ReactionButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: jest.fn()
}))

const mockUsePlausible = usePlausible as jest.MockedFunction<
  typeof usePlausible
>

const journey = {
  id: 'journey.id'
} as unknown as Journey

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const block = {
  id: 'block.id'
} as TreeBlock<StepFields>

describe('ReactionButton', () => {
  it('should render thumbs up button', () => {
    const { getByTestId } = render(<ReactionButton variant="thumbsup" />)
    expect(getByTestId('ThumbsUpIcon')).toBeInTheDocument()
  })

  it('should render thumbs down button', () => {
    const { getByTestId } = render(<ReactionButton variant="thumbsdown" />)
    expect(getByTestId('ThumbsDownIcon')).toBeInTheDocument()
  })

  it('should add event to plausible', async () => {
    const mockPlausible = jest.fn()
    blockHistoryVar([block])
    mockUsePlausible.mockReturnValue(mockPlausible)

    render(
      <JourneyProvider value={{ journey, variant: 'default' }}>
        <ReactionButton variant="thumbsdown" />
      </JourneyProvider>
    )

    fireEvent.click(screen.getByTestId('ThumbsDownIcon'))

    await waitFor(() => {
      expect(mockPlausible).toHaveBeenCalledWith(
        'footerThumbsDownButtonClick',
        {
          props: {
            blockId: 'block.id',
            key: keyify({
              stepId: 'block.id',
              event: 'footerThumbsDownButtonClick',
              blockId: 'block.id'
            }),
            simpleKey: keyify({
              stepId: 'block.id',
              event: 'footerThumbsDownButtonClick',
              blockId: 'block.id'
            })
          }
        }
      )
    })
  })
})
