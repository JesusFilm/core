import { render } from '@testing-library/react'
import { Attribute } from '.'

describe('Attribute', () => {
  it('should render attribute', () => {
    const { getByText } = render(
      <Attribute
        icon={<>test</>}
        name="name"
        value="value"
        description="description"
      />
    )
    expect(getByText('test')).toBeInTheDocument()
    expect(getByText('name')).toBeInTheDocument()
    expect(getByText('value')).toBeInTheDocument()
    expect(getByText('description')).toBeInTheDocument()
  })
})
