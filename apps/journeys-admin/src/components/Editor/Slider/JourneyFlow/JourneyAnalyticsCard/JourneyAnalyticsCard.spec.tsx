import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { render, screen, waitFor, within } from '@testing-library/react'
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

    expect(stats.length).toBe(3)

    expect(within(stats[0]).getByText('Visitors')).toBeInTheDocument()
    expect(within(stats[0]).getByText('100')).toBeInTheDocument()
    expect(within(stats[1]).getByText('Chats Started')).toBeInTheDocument()
    expect(within(stats[1]).getByText('100')).toBeInTheDocument()
    expect(within(stats[2]).getByText('Sites Visited')).toBeInTheDocument()
    expect(within(stats[2]).getByText('100')).toBeInTheDocument()
  })
})
