import { fireEvent, render } from '@testing-library/react'
import noop from 'lodash/noop'

import { LanguagesFilter } from '.'

describe('LanguagesFilter', () => {
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

  it('should render label and helper text', () => {
    const { getByText, getByRole } = render(
      <LanguagesFilter onChange={noop} loading={false} languages={languages} />
    )

    expect(
      getByRole('combobox', { name: 'Search Languages' })
    ).toBeInTheDocument()
    expect(getByText('2000+ languages')).toBeInTheDocument()
  })

  it('should size two-line options taller than single-line options', () => {
    const { getByRole, getAllByRole } = render(
      <LanguagesFilter onChange={noop} loading={false} languages={languages} />
    )

    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })

    const options = getAllByRole('option')
    const englishOption = options.find((option) =>
      option.textContent?.includes('English')
    )
    const germanOption = options.find((option) =>
      option.textContent?.includes('German, Standard')
    )

    expect(englishOption?.textContent).toBe('English')
    expect(germanOption?.textContent).toBe('German, StandardDeutsch')
    expect(englishOption).toHaveStyle({ height: '45px' })
    expect(germanOption).toHaveStyle({ height: '68px' })
  })
})
