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
})
