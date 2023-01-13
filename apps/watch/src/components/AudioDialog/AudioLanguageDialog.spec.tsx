import { render, fireEvent, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'
import { AudioLanguageDialog } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('AudioLanguageDialog', () => {
  it('should sort langauge options alphabetically', async () => {
    const { getByRole, queryAllByRole } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <AudioLanguageDialog open onClose={jest.fn()} />
      </VideoProvider>
    )
    await waitFor(() => fireEvent.focus(getByRole('textbox')))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[0]).toHaveTextContent("'Auhelawa'Auhelawa")
    expect(queryAllByRole('option')[1]).toHaveTextContent('A-HmaoA-Hmao')
    expect(queryAllByRole('option')[2]).toHaveTextContent('AariAari')
  })

  it('should set default value', async () => {
    const { getByRole } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <AudioLanguageDialog open onClose={jest.fn()} />
      </VideoProvider>
    )
    await waitFor(() => expect(getByRole('textbox')).toHaveValue('English'))
  })

  it('should redirect to the selected language', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByRole, queryAllByRole } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <AudioLanguageDialog open onClose={jest.fn()} />
      </VideoProvider>
    )
    await waitFor(() => fireEvent.focus(getByRole('textbox')))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[1]).toHaveTextContent('A-HmaoA-Hmao')
    fireEvent.click(queryAllByRole('option')[1])
    await waitFor(() => expect(push).toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith('/jesus/a-hmao')
  })
})
