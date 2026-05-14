import { fireEvent, render, waitFor } from '@testing-library/react'
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
})
