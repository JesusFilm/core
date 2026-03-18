import { render } from '@testing-library/react'
import noop from 'lodash/noop'

import { LanguagesFilter } from '.'

describe('LanguagesFilter', () => {
  it('should render label and helper text', () => {
    const languages = [
      {
        __typename: 'Language',
        id: '529',
        slug: 'english',
        name: [
          {
            value: 'English',
            primary: true,
            __typename: 'LanguageName'
          }
        ]
      },
      {
        id: '496',
        __typename: 'Language',
        slug: 'french',
        name: [
          {
            value: 'Français',
            primary: true,
            __typename: 'LanguageName'
          },
          {
            value: 'French',
            primary: false,
            __typename: 'LanguageName'
          }
        ]
      },
      {
        id: '1106',
        __typename: 'Language',
        slug: 'german-standard',
        name: [
          {
            value: 'Deutsch',
            primary: true,
            __typename: 'LanguageName'
          },
          {
            value: 'German, Standard',
            primary: false,
            __typename: 'LanguageName'
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
