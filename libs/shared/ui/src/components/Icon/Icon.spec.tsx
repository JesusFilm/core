import { render } from '@testing-library/react'
import { Icon, IconProps } from '.'
import { IconColor, IconName } from '../../../__generated__/globalTypes'

const block: IconProps = {
  __typename: 'Icon',
  name: IconName.CheckCircle,
  color: IconColor.error,
  fontSize: '48px'
}

describe('Icon', () => {
  it('should render the icon successfully', () => {
    const { getByTestId } = render(<Icon {...block} />)
    expect(getByTestId('CheckCircleIcon')).toBeTruthy()
  })
})
