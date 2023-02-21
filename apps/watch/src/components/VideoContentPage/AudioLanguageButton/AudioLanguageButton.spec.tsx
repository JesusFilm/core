import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'
import { AudioLanguageButton } from '.'

describe('AudioLanguageButton', () => {
  it('renders audio language as a button', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="button" />
        </VideoProvider>
      </MockedProvider>
    )
    await waitFor(() => fireEvent.click(getByRole('button')))

    expect(getByText('2039 Languages Available')).toBeInTheDocument()
  })
  it('renders audio language as an icon', async () => {
    const { getByTestId, getByText } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageButton componentVariant="icon" />
        </VideoProvider>
      </MockedProvider>
    )
    await waitFor(() => fireEvent.click(getByTestId('LanguageOutlinedIcon')))
    expect(getByText('2039 Languages Available')).toBeInTheDocument()
  })
})
