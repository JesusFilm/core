import { render } from '@testing-library/react'
import { Icon, IconProps } from '.'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../__generated__/globalTypes'

const block: IconProps = {
  __typename: 'Icon',
  name: IconName.CheckCircle,
  color: IconColor.error,
  size: IconSize.md
}

describe('Icon', () => {
  it('should render the icon successfully', () => {
    const { getByTestId } = render(<Icon {...block} />)
    expect(getByTestId('CheckCircleIcon')).toHaveClass('MuiSvgIcon-root')
  })
  it('should render small icon', () => {
    const { getByTestId } = render(<Icon {...block} size={IconSize.sm} />)
    expect(getByTestId('CheckCircleIcon')).toHaveStyle('font-size: 16px')
  })
  it('should render medium icon', () => {
    const { getByTestId } = render(<Icon {...block} size={IconSize.md} />)
    expect(getByTestId('CheckCircleIcon')).toHaveStyle('font-size: 20px')
  })
  it('should render large icon', () => {
    const { getByTestId } = render(<Icon {...block} size={IconSize.lg} />)
    expect(getByTestId('CheckCircleIcon')).toHaveStyle('font-size: 28px')
  })
  it('should render extra large icon', () => {
    const { getByTestId } = render(<Icon {...block} size={IconSize.xl} />)
    expect(getByTestId('CheckCircleIcon')).toHaveStyle('font-size: 48px')
  })
})
