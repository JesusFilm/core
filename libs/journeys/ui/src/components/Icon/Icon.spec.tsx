import { render } from '@testing-library/react'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../__generated__/globalTypes'
import { ButtonFields_startIcon as IconType } from '../Button/__generated__/ButtonFields'
import { Icon } from '.'

const block: IconType = {
  __typename: 'Icon',
  name: IconName.CheckCircleRounded,
  color: IconColor.error,
  size: IconSize.md
}

describe('Icon', () => {
  it('should render the icon successfully', () => {
    const { getByTestId } = render(<Icon {...block} />)
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveClass('MuiSvgIcon-root')
  })
  it('should render small icon', () => {
    const { getByTestId } = render(<Icon {...block} size={IconSize.sm} />)
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveStyle('font-size: 16px')
  })
  it('should render medium icon', () => {
    const { getByTestId } = render(<Icon {...block} size={IconSize.md} />)
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveStyle('font-size: 20px')
  })
  it('should render large icon', () => {
    const { getByTestId } = render(<Icon {...block} size={IconSize.lg} />)
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveStyle('font-size: 28px')
  })
  it('should render extra large icon', () => {
    const { getByTestId } = render(<Icon {...block} size={IconSize.xl} />)
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveStyle('font-size: 48px')
  })
})
