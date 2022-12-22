import { render, fireEvent, waitFor } from '@testing-library/react'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/testData'
import { AudioLanguageButton } from '.'

describe('AudioLanguageButton', () => {
  it('renders audio language as a button', async () => {
    const { getByRole, getAllByText } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <AudioLanguageButton componentVariant="button" />
      </VideoProvider>
    )
    await waitFor(() => fireEvent.click(getByRole('button')))

    expect(getAllByText('3 Languages Available')[0]).toBeInTheDocument()
  })
  it('renders audio language as an icon', async () => {
    const { getByTestId, getAllByText } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <AudioLanguageButton componentVariant="icon" />
      </VideoProvider>
    )
    await waitFor(() => fireEvent.click(getByTestId('LanguageOutlinedIcon')))
    expect(getAllByText('3 Languages Available')[0]).toBeInTheDocument()
  })
})
