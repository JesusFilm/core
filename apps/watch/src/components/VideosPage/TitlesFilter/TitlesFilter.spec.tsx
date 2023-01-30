import { render } from '@testing-library/react'
import { noop } from 'lodash'
import { TitlesFilter } from '.'

describe('TitlesFilter', () => {
  it('should render label and helper text', () => {
    const titles = [
      {
        id: '529',
        title: [{ value: 'JESUS' }],
        label: 'segment'
      },
      {
        id: '529',
        title: [{ value: 'Magdelena' }],
        label: 'segment'
      }
    ]

    const { getByText, getByRole } = render(
      <TitlesFilter onChange={noop} loading={false} titles={titles} />
    )

    expect(getByRole('combobox', { name: 'Search Titles' })).toBeInTheDocument()
    expect(getByText('+724 titles')).toBeInTheDocument()
  })
})
