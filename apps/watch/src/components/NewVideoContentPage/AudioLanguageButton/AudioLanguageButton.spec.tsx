import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { AudioLanguageButton } from '.'

describe('AudioLanguageButton', () => {
  it('renders audio language as a button', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="button" />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(screen.getByLabelText('Language Settings')).toBeInTheDocument()
    )
  })

  it('renders audio language as an icon', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="icon" />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('LanguageOutlinedIcon'))
    await waitFor(() =>
      expect(screen.getByLabelText('Language Settings')).toBeInTheDocument()
    )
  })
})
