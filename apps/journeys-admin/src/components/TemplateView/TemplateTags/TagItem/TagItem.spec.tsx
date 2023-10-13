import { render } from '@testing-library/react'

import Grid1Icon from '@core/shared/ui/icons/Grid1'

import { TagItem } from './TagItem'

describe('TagItem', () => {
  it('should render name and icon', () => {
    const { getByTestId, getByText } = render(
      <TagItem name="tag name" icon={<Grid1Icon />} />
    )

    expect(getByText('tag name')).toBeInTheDocument()
    expect(getByTestId('Grid1Icon')).toBeInTheDocument()
  })
})
