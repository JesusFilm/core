import { render, screen, waitFor, within } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { LanguageScreenCardPreview } from './LanguageScreenCardPreview'
import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'
import { MockedProvider } from '@apollo/client/testing'

const mockJourney = {
  ...journey,
  blocks: [
    {
      id: 'step0id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: 'step1id'
    },
    {
      id: 'card0id',
      __typename: 'CardBlock',
      parentBlockId: 'step0id',
      parentOrder: 0
    },
    {
      id: 'step1id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 1,
      locked: false,
      nextBlockId: null
    },
    {
      id: 'card0id',
      __typename: 'CardBlock',
      parentBlockId: 'step1id',
      parentOrder: 0
    }
  ] as unknown as TreeBlock[]
}

describe('LanguageScreenCardPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders BlockRenderer with first step', async () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourney, variant: 'admin' }}>
          <LanguageScreenCardPreview />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(
      screen.getByTestId('LanguageScreenCardPreviewFramePortal')
    ).toBeInTheDocument()
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    await waitFor(() => expect(iframe?.contentDocument?.body).toBeTruthy())
  })
})
