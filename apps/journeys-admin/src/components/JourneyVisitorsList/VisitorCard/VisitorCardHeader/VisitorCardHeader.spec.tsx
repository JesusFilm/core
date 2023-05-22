import { render } from '@testing-library/react'
import { VisitorStatus } from '../../../../../__generated__/globalTypes'
import { VisitorCardHeader } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('VisitorCardHeader', () => {
  it('should show header', () => {
    const props = {
      icon: VisitorStatus.star,
      name: 'test name',
      location: 'location',
      source: 'source',
      createdAt: '2021-11-19T12:34:56.647Z',
      duration: 75
    }

    const { getAllByText } = render(<VisitorCardHeader {...props} />)
    expect(getAllByText('test name')).toHaveLength(2)
    expect(getAllByText('location')).toHaveLength(2)
    expect(getAllByText('source')).toHaveLength(2)
    expect(getAllByText('12:34pm, Nov. 19th')).toHaveLength(2)
    expect(getAllByText('⭐')).toHaveLength(2)
    expect(getAllByText('1 min')).toHaveLength(2)
  })

  it('should show person icon', () => {
    const props = {
      icon: null,
      name: '12345234',
      location: null,
      source: null,
      createdAt: '2021-11-19T12:34:56.647Z',
      duration: 45
    }

    const { getAllByTestId } = render(<VisitorCardHeader {...props} />)
    expect(getAllByTestId('PersonOutlineRoundedIcon')).toHaveLength(2)
  })
})
