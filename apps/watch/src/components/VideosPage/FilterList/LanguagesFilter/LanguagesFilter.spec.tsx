import { render } from '@testing-library/react'
import noop from 'lodash/noop'

import { LanguagesFilter } from '.'

describe('LanguagesFilter', () => {
  it('should render label and helper text', () => {
    const languages = [
      {
        id: '529',
        name: [
          {
            value: 'English',
            primary: true
          }
        ]
      },
      {
        id: '496',
        name: [
          {
            value: 'Français',
            primary: true
          },
          {
            value: 'French',
            primary: false
          }
        ]
      },
      {
        id: '1106',
        name: [
          {
            value: 'Deutsch',
            primary: true
          },
          {
            value: 'German, Standard',
            primary: false
          }
        ]
      }
    ]

    const { getByText, getByRole } = render(
      <LanguagesFilter onChange={noop} loading={false} languages={languages} />
    )

    expect(
      getByRole('combobox', { name: 'Search Languages' })
    ).toBeInTheDocument()
    expect(getByText('2000+ languages')).toBeInTheDocument()
  })
})
