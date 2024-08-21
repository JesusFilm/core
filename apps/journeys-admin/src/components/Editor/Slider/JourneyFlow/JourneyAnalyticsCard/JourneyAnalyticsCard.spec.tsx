import { render, screen, within } from '@testing-library/react'

import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'

import { JourneyAnalyticsCard } from './JourneyAnalyticsCard'

describe('JourneyAnalyticsCard', () => {
  it('should render', async () => {
    const initialState = {
      analytics: {
        totalVisitors: 100,
        chatsStarted: 100,
        linksVisited: 100
      }
    } as unknown as EditorState
    render(
      <EditorProvider initialState={initialState}>
        <JourneyAnalyticsCard />
      </EditorProvider>
    )

    const stats = screen.getAllByTestId('JourneyAnalyticsCardStat')

    expect(stats).toHaveLength(3)

    expect(within(stats[0]).getByText('Visitors')).toBeInTheDocument()
    expect(within(stats[0]).getByText('100')).toBeInTheDocument()
    expect(within(stats[1]).getByText('Chats')).toBeInTheDocument()
    expect(within(stats[1]).getByText('100')).toBeInTheDocument()
    expect(within(stats[2]).getByText('Site Visits')).toBeInTheDocument()
    expect(within(stats[2]).getByText('100')).toBeInTheDocument()
  })
})
