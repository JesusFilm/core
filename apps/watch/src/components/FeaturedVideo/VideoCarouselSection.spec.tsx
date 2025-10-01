import { render, screen } from '@testing-library/react'
import { PlayerProvider } from '../../libs/playerContext'
import { VideoCarouselProvider } from '../../libs/videoCarouselContext'
import { WatchProvider } from '../../libs/watchContext'

import { VideoCarouselSection } from './VideoCarouselSection'

describe('VideoCarouselSection', () => {
  it('renders VideoCarousel and children inside ContentPageBlurFilter', () => {
    render(
      <VideoCarouselProvider>
        <PlayerProvider initialState={{ mute: false }}>
          <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: false }}>
            <VideoCarouselSection>
              <div data-testid="test-child">Test Child</div>
            </VideoCarouselSection>
          </WatchProvider>
        </PlayerProvider>
      </VideoCarouselProvider>
    )

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('renders without children', () => {
    render(
      <VideoCarouselProvider>
        <PlayerProvider initialState={{ mute: false }}>
          <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: false }}>
            <VideoCarouselSection />
          </WatchProvider>
        </PlayerProvider>
      </VideoCarouselProvider>
    )

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })
})

