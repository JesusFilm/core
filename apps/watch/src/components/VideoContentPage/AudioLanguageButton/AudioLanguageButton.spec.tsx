import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { videos } from '@core/watch/ui/testDataGenerator/__generated__/testData'

import { VideoProvider } from '../../../libs/videoContext'

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
    fireEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(getByText('2039 Languages Available')).toBeInTheDocument()
    )
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
