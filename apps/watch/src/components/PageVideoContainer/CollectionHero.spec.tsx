import { render, screen } from '@testing-library/react'

import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { CollectionHero } from './CollectionHero'

describe('CollectionHero', () => {
  it('renders collection cover image', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <CollectionHero />
      </VideoProvider>
    )

    expect(screen.getByTestId('CollectionHero')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
