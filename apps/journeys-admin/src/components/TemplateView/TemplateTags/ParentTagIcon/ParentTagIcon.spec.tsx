import { render } from '@testing-library/react'

import { ParentTagIcon } from '.'

describe('getParentTagsWithIcon', () => {
  it('should get Topics icon', () => {
    const { getByTestId } = render(<ParentTagIcon name="Topics" />)
    expect(getByTestId('Hash2Icon')).toBeInTheDocument()
  })

  it('should get Felt Needs icon', () => {
    const { getByTestId } = render(<ParentTagIcon name="Felt Needs" />)
    expect(getByTestId('SmileyNeutralIcon')).toBeInTheDocument()
  })

  it('should get Holidays icon', () => {
    const { getByTestId } = render(<ParentTagIcon name="Holidays" />)
    expect(getByTestId('Calendar4Icon')).toBeInTheDocument()
  })

  it('should get Audience icon', () => {
    const { getByTestId } = render(<ParentTagIcon name="Audience" />)
    expect(getByTestId('UsersProfiles2Icon')).toBeInTheDocument()
  })

  it('should get Genre icon', () => {
    const { getByTestId } = render(<ParentTagIcon name="Genre" />)
    expect(getByTestId('MediaStrip1Icon')).toBeInTheDocument()
  })

  it('should get Collections icon', () => {
    const { getByTestId } = render(<ParentTagIcon name="Collections" />)
    expect(getByTestId('Grid1Icon')).toBeInTheDocument()
  })

  it('should return default icon', () => {
    const { getByTestId } = render(<ParentTagIcon />)
    expect(getByTestId('TagIcon')).toBeInTheDocument()
  })
})
