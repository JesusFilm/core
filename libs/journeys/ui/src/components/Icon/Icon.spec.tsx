import { render } from '@testing-library/react'

import {
  IconColor,
  IconName,
  IconSize
} from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'

import { IconFields } from './__generated__/IconFields'

import { Icon } from '.'

const block: TreeBlock<IconFields> = {
  id: 'id',
  __typename: 'IconBlock',
  parentBlockId: 'parent',
  parentOrder: 0,
  iconName: IconName.CheckCircleRounded,
  iconColor: IconColor.error,
  iconSize: IconSize.md,
  children: []
}

describe('Icon', () => {
  it('should render the icon successfully', () => {
    const { getByTestId } = render(<Icon {...block} />)
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveClass('MuiSvgIcon-root')
  })

  it('should render nothing', () => {
    const { getByTestId } = render(<Icon {...block} iconName={null} />)
    expect(getByTestId('None')).toBeInTheDocument()
  })

  it('should render small icon', () => {
    const { getByTestId } = render(<Icon {...block} iconSize={IconSize.sm} />)
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveStyle('font-size: 16px')
  })

  it('should render medium icon', () => {
    const { getByTestId } = render(<Icon {...block} iconSize={IconSize.md} />)
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveStyle('font-size: 20px')
  })

  it('should render large icon', () => {
    const { getByTestId } = render(<Icon {...block} iconSize={IconSize.lg} />)
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveStyle('font-size: 28px')
  })

  it('should render extra large icon', () => {
    const { getByTestId } = render(<Icon {...block} iconSize={IconSize.xl} />)
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveStyle('font-size: 48px')
  })
})
