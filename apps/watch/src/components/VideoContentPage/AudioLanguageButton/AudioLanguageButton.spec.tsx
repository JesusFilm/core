import { render, fireEvent, waitFor } from '@testing-library/react'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { AudioLanguageButton } from '.'

describe('AudioLanguageButton', () => {
  it('renders audio language as a button', async () => {
    const { getByRole, getByText } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <AudioLanguageButton />
      </VideoProvider>
    )
    await waitFor(() => fireEvent.click(getByRole('button')))

    expect(getByText('3 Languages Available')).toBeInTheDocument()
  })
})
