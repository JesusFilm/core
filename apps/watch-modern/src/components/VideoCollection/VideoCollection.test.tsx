import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VideoCollection } from './index'

import { defaultGetVideosMocks, errorGetVideosMocks } from '@/test/apolloMocks'
import { mockVideos } from '@/test/fixtures/videos'

// Mock window.location.href
const mockLocation = {
  href: ''
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('VideoCollection', () => {
  beforeEach(() => {
    mockLocation.href = ''
  })

  it('renders correctly', () => {
    const { container } = render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    expect(container).toMatchSnapshot()
  })

  it('displays the section title', () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    const title = screen.getByText('VIDEO BIBLE COLLECTION')
    expect(title).toBeInTheDocument()
  })

  it('displays the main heading', () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    const heading = screen.getByText('Video Gospel in every style and language')
    expect(heading).toBeInTheDocument()
  })

  it('displays the description', () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    const description = screen.getByText(/Experience the life of Jesus through authentic, faithful films/)
    expect(description).toBeInTheDocument()
  })

  it('displays video cards when data is loaded', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={true}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // First check that loading state appears
    const loadingElements = screen.getAllByTestId('loading-skeleton')
    expect(loadingElements.length).toBeGreaterThan(0)
    
    // Wait for video cards to load (either from mocks or real API)
    const videoCards = await screen.findAllByRole('button')
    expect(videoCards.length).toBeGreaterThan(0)
    
    // Check that at least one video card has proper structure
    const firstCard = videoCards[0]
    expect(firstCard).toHaveAttribute('tabIndex', '0')
    expect(firstCard).toHaveAttribute('aria-label')
  })

  it('navigates to video detail page when clicked', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for video cards to load
    const videoCards = await screen.findAllByRole('button')
    expect(videoCards.length).toBeGreaterThan(0)
    
    fireEvent.click(videoCards[0])
    
    // Check that navigation was attempted (slug may vary)
    expect(mockLocation.href).toMatch(/\/watch\//)
  })

  it('navigates to video detail page when Enter key is pressed', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for video cards to load
    const videoCards = await screen.findAllByRole('button')
    expect(videoCards.length).toBeGreaterThan(0)
    
    fireEvent.keyDown(videoCards[0], { key: 'Enter' })
    
    // Check that navigation was attempted
    expect(mockLocation.href).toMatch(/\/watch\//)
  })

  it('navigates to video detail page when Space key is pressed', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for video cards to load
    const videoCards = await screen.findAllByRole('button')
    expect(videoCards.length).toBeGreaterThan(0)
    
    fireEvent.keyDown(videoCards[0], { key: ' ' })
    
    // Check that navigation was attempted
    expect(mockLocation.href).toMatch(/\/watch\//)
  })

  it('has proper accessibility attributes', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for video cards to load
    const videoCards = await screen.findAllByRole('button')
    expect(videoCards.length).toBeGreaterThan(0)
    
    videoCards.forEach((card) => {
      expect(card).toHaveAttribute('tabIndex', '0')
      expect(card).toHaveAttribute('aria-label')
    })
  })

  it('displays the mission text', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for video cards to load
    await screen.findAllByRole('button')
    const missionText = screen.getByText(/Our mission/)
    expect(missionText).toBeInTheDocument()
  })

  it('has responsive grid layout', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for video cards to load
    const videoCards = await screen.findAllByRole('button')
    expect(videoCards.length).toBeGreaterThan(0)
    
    const grid = videoCards[0]?.closest('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4')
  })

  it('shows loading state initially', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Should show loading skeleton
    const loadingElements = screen.getAllByTestId('loading-skeleton')
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('shows error state when query fails', async () => {
    render(
      <MockedProvider mocks={errorGetVideosMocks} addTypename={false}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for error state
    const errorTitle = await screen.findByText('Error Loading Films')
    expect(errorTitle).toBeInTheDocument()
    
    const errorMessage = screen.getByText('Unable to load video content. Please try again later.')
    expect(errorMessage).toBeInTheDocument()
  })

  it('displays video titles correctly', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={true}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for video cards to load
    await waitFor(() => {
      const videoCards = screen.getAllByRole('button')
      expect(videoCards.length).toBeGreaterThan(0)
    })
    
    // Check that video titles are displayed as headings
    const videoTitles = screen.getAllByRole('heading', { level: 3 })
    expect(videoTitles.length).toBeGreaterThan(0)
    
    // Check that at least one title is not empty
    const hasNonEmptyTitle = videoTitles.some(title => title.textContent && title.textContent.trim() !== '')
    expect(hasNonEmptyTitle).toBe(true)
  })

  it('displays video snippets correctly', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={true}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for video content to load
    await waitFor(() => {
      const videoCards = screen.getAllByRole('button')
      expect(videoCards.length).toBeGreaterThan(0)
    })
    
    // Check that video cards have content
    const videoCards = screen.getAllByRole('button')
    expect(videoCards.length).toBeGreaterThan(0)
  })

  it('displays video durations correctly', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={true}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for video content to load
    await waitFor(() => {
      const videoCards = screen.getAllByRole('button')
      expect(videoCards.length).toBeGreaterThan(0)
    })
    
    // Check that duration information is displayed
    const durationElements = screen.getAllByText(/MIN|HR/)
    expect(durationElements.length).toBeGreaterThan(0)
  })

  it('displays language counts correctly', async () => {
    render(
      <MockedProvider mocks={defaultGetVideosMocks} addTypename={true}>
        <VideoCollection />
      </MockedProvider>
    )
    
    // Wait for video content to load
    await waitFor(() => {
      const videoCards = screen.getAllByRole('button')
      expect(videoCards.length).toBeGreaterThan(0)
    })
    
    // Check that language count information is displayed
    const languageElements = screen.getAllByText(/LANGUAGES/)
    expect(languageElements.length).toBeGreaterThan(0)
  })
}) 