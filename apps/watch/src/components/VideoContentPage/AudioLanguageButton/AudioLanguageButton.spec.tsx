import { render, fireEvent, waitFor } from '@testing-library/react'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'
import { AudioLanguageButton } from '.'

describe('AudioLanguageButton', () => {
  it('renders audio language as a button', async () => {
    const { getByRole, getByText } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <AudioLanguageButton componentVariant="button" />
      </VideoProvider>
    )
    await waitFor(() => fireEvent.click(getByRole('button')))

    expect(getByText('3 Languages Available')).toBeInTheDocument()
  })
  it('renders audio language as an icon', async () => {
    const { getByTestId, getByText } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <AudioLanguageButton componentVariant="icon" />
      </VideoProvider>
    )
    await waitFor(() => fireEvent.click(getByTestId('LanguageOutlinedIcon')))
    expect(getByText('3 Languages Available')).toBeInTheDocument()
  })
})
