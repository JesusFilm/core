import { MockedProvider } from '@apollo/client/testing'
import { userEvent } from '@storybook/test'
import { render, screen, waitFor } from '@testing-library/react'

import { VideoProvider } from '../../../../libs/videoContext'
import { videos } from '../../../Videos/__generated__/testData'

import { ContentHeader } from './ContentHeader'

describe('ContentHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with a logo', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentHeader />
      </VideoProvider>
    )

    const header = screen.getByRole('img', { name: 'JesusFilm Project' })
    expect(header).toBeInTheDocument()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })

  it('opens audio language dialog on language button click', async () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <ContentHeader />
        </VideoProvider>
      </MockedProvider>
    )
    const user = userEvent.setup()

    await user.click(screen.getByTestId('LanguageOutlinedIcon'))

    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveValue('English')
    )
  })
})
