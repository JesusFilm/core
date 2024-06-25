import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { JourneyAnalytics } from '@core/journeys/ui/useJourneyAnalyticsQuery'
import { render, screen } from '@testing-library/react'
import { FooterAnalytics } from '.'

describe('FooterAnalytics', () => {
  it('should render', () => {
    const initialState = {
      selectedStep: {
        id: 'step1.id'
      } as unknown as TreeBlock<BlockFields_StepBlock>,
      showAnalytics: true,
      analytics: {
        stepMap: new Map([
          [
            'step1.id',
            {
              eventMap: new Map([
                ['footerThumbsUpButtonClick', 10],
                ['footerThumbsDownButtonClick', 2],
                ['footerChatButtonClick', 5]
              ])
            }
          ]
        ])
      } as unknown as JourneyAnalytics
    }

    render(
      <EditorProvider initialState={initialState}>
        <FooterAnalytics />
      </EditorProvider>
    )

    expect(screen.getByTestId('ThumbsUpIcon')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByTestId('ThumbsDownIcon')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByTestId('FacebookIcon')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
