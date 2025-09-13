import { render } from '@testing-library/react'

import { TemplateCreatorDetails } from './TemplateCreatorDetails'

describe('TemplateCreatorDetails', () => {
  it('should show creator image and descriptions', () => {
    const { getByRole, getByText } = render(
      <TemplateCreatorDetails
        creatorDetails="Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries"
        creatorImage="https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920"
      />
    )

    expect(
      getByText(
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries'
      )
    ).toBeInTheDocument()
    expect(getByRole('img')).toBeInTheDocument()
  })

  it('should take custom styles for the underlying stack component', () => {
    const { getByTestId } = render(
      <TemplateCreatorDetails sx={{ backgroundColor: 'red' }} />
    )

    expect(getByTestId('TemplateCreatorDetails')).toHaveStyle(
      'background-color: rgb(255, 0, 0)'
    )
  })
})
