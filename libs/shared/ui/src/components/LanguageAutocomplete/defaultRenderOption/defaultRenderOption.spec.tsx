import { render, screen } from '@testing-library/react'

import { defaultRenderOption } from './defaultRenderOption'

describe('defaultRenderOption', () => {
  it('should show local name and native name of language', () => {
    render(
      defaultRenderOption({
        index: 0,
        style: { backgroundColor: 'red' },
        rows: [
          [
            {
              key: 'Aja-Gbe',
              tabIndex: -1,
              role: 'option',
              id: ':r0:-option-0',
              'data-option-index': 0,
              'aria-disabled': false,
              'aria-selected': false,
              className: 'MuiAutocomplete-option',
              onClick: vi.fn()
            },
            {
              id: '1280',
              localName: 'Aja-Gbe',
              nativeName: 'Aja-Gbe-LocalName'
            },
            0
          ]
        ]
      } as any)
    )
    expect(
      screen.getByRole('option', { name: 'Aja-Gbe Aja-Gbe-LocalName' })
    ).toBeInTheDocument()
    expect(screen.getByText('Aja-Gbe')).toBeInTheDocument()
    expect(screen.getByText('Aja-Gbe-LocalName')).toBeInTheDocument()
  })

  it('should show only one line when there is no native name', () => {
    render(
      defaultRenderOption({
        index: 0,
        style: { backgroundColor: 'red' },
        rows: [
          [
            {
              key: 'English',
              tabIndex: -1,
              role: 'option',
              id: ':r0:-option-0',
              'data-option-index': 0,
              'aria-disabled': false,
              'aria-selected': false,
              className: 'MuiAutocomplete-option',
              onClick: vi.fn()
            },
            {
              id: '529',
              localName: undefined,
              nativeName: 'English'
            },
            0
          ]
        ]
      } as any)
    )
    expect(
      screen.getByRole('option', { name: 'English' })
    ).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })
})
