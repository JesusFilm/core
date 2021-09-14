import { render } from '@testing-library/react'
import { Icon, IconProps } from '.'

const block: IconProps = {
  icon: 'checkCircle'
}

describe('Icon', () => {
  it('should render the icon successfully', () => {
    const { getByTestId } = render(<Icon {...block} />)
    expect(getByTestId('CheckCircleIcon')).toBeTruthy()
  })
})
