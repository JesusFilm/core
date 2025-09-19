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
              onClick: jest.fn()
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
})
