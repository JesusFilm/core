import { render } from '@testing-library/react'
import { noop } from 'lodash'
import { TitlesFilter } from '.'

describe('TitlesFilter', () => {
  it('should render label and helper text', () => {
    const titles = [
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
      <TitlesFilter onChange={noop} loading={false} titles={titles} />
    )

    expect(getByRole('combobox', { name: 'Search Titles' })).toBeInTheDocument()
    expect(getByText('+2000 titles')).toBeInTheDocument()
  })
})
