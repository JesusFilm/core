import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'

import { LanguagesFilterPopper } from './LanguagesFilterPopper'

describe('LanguagesFilterPopper', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should call on Submit on change', async () => {
    const onSubmit = vi.fn()
    const sortedLanguages = [
      { id: '529', localName: undefined, nativeName: 'English' },
      { id: '496', localName: 'French', nativeName: 'Français' },
      { id: '1106', localName: 'German, Standard', nativeName: 'Deutsch' }
    ]
    const { getByRole } = render(
      <LanguagesFilterPopper
        initialValues={[]}
        open
        setOpen={noop}
        onSubmit={onSubmit}
        anchorEl={null}
        sortedLanguages={sortedLanguages}
      />
    )
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.click(getByRole('button', { name: 'English' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'English' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
  })

  it('should re-select English when closed with no language selected', async () => {
    const onSubmit = vi.fn()
    const setOpen = vi.fn()
    const sortedLanguages = [
      { id: '529', localName: undefined, nativeName: 'English' },
      { id: '496', localName: 'French', nativeName: 'Français' },
      { id: '1106', localName: 'German, Standard', nativeName: 'Deutsch' }
    ]
    render(
      <LanguagesFilterPopper
        initialValues={[
          { id: '529', localName: undefined, nativeName: 'English' }
        ]}
        open
        setOpen={setOpen}
        onSubmit={onSubmit}
        anchorEl={null}
        sortedLanguages={sortedLanguages}
      />
    )
    // deselect English so nothing remains selected
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    // close the dropdown by clicking the backdrop
    fireEvent.click(screen.getByTestId('PresentationLayer'))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenLastCalledWith({
        languages: [{ id: '529', localName: undefined, nativeName: 'English' }]
      })
    )
    expect(setOpen).toHaveBeenCalledWith(false)
  })

  it('should keep the selection when closed with a language selected', async () => {
    const onSubmit = vi.fn()
    const setOpen = vi.fn()
    const sortedLanguages = [
      { id: '529', localName: undefined, nativeName: 'English' },
      { id: '496', localName: 'French', nativeName: 'Français' },
      { id: '1106', localName: 'German, Standard', nativeName: 'Deutsch' }
    ]
    render(
      <LanguagesFilterPopper
        initialValues={[
          { id: '496', localName: 'French', nativeName: 'Français' }
        ]}
        open
        setOpen={setOpen}
        onSubmit={onSubmit}
        anchorEl={null}
        sortedLanguages={sortedLanguages}
      />
    )
    // close the dropdown without changing the selection
    fireEvent.click(screen.getByTestId('PresentationLayer'))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(setOpen).toHaveBeenCalledWith(false)
  })
})
