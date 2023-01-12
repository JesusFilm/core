import { render, fireEvent, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { MockedProvider } from '@apollo/client/testing'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/testData'
import { getLanguagesSlugMock } from './testData'
import { AudioLanguageDialog } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('AudioLanguageDialog', () => {
  it('should sort langauge options alphabetically', async () => {
    const { getByRole, queryAllByRole } = render(
      <MockedProvider mocks={[getLanguagesSlugMock]}>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageDialog open onClose={jest.fn()} />
        </VideoProvider>
      </MockedProvider>
    )
    await waitFor(() => fireEvent.focus(getByRole('textbox')))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    await waitFor(() =>
      expect(queryAllByRole('option')[0]).toHaveTextContent('English')
    )
    expect(queryAllByRole('option')[1]).toHaveTextContent('French')
    expect(queryAllByRole('option')[2]).toHaveTextContent('German')
  })

  it('should set default value', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageDialog open onClose={jest.fn()} />
        </VideoProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getByRole('textbox')).toHaveValue('English'))
  })

  it('should redirect to the selected language', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByRole, queryAllByRole } = render(
      <MockedProvider mocks={[getLanguagesSlugMock]}>
        <VideoProvider value={{ content: videos[0] }}>
          <AudioLanguageDialog open onClose={jest.fn()} />
        </VideoProvider>
      </MockedProvider>
    )
    await waitFor(() => fireEvent.focus(getByRole('textbox')))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[1]).toHaveTextContent('French')
    fireEvent.click(queryAllByRole('option')[1])
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/jesus/french')
    })
  })
})
