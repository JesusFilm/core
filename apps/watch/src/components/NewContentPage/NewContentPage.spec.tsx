import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NewContentPage } from './NewContentPage'
import { videos } from '../Videos/__generated__/testData'
import { VideoProvider } from '../../libs/videoContext'
import { MockedProvider } from '@apollo/client/testing'

describe('NewContentPage', () => {
  it('should render', () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <NewContentPage />
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('ContentHero')).toBeInTheDocument()
    expect(screen.getByTestId('ContentHeader')).toBeInTheDocument()
    expect(screen.getByTestId('ContentHeroVideoContainer')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
    expect(screen.getByTestId('ContentMetadata')).toBeInTheDocument()
    expect(screen.getByTestId('ContentDiscussionQuestions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('should render ShareDialog when button is clicked', async () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <NewContentPage />
        </VideoProvider>
      </MockedProvider>
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Share' }))

    expect(screen.getByTestId('ShareDialog')).toBeInTheDocument()
  })
})
