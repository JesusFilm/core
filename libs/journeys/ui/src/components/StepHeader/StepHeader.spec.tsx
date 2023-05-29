import { fireEvent, render } from '@testing-library/react'
import { TreeBlock } from '../../libs/block'
import { StepFields } from '../Step/__generated__/StepFields'
import { StepHeader } from './StepHeader'

const block: TreeBlock<StepFields> = {
  __typename: 'StepBlock',
  id: 'Step1',
  parentBlockId: null,
  parentOrder: 0,
  nextBlockId: null,
  locked: false,
  children: []
}

describe('StepHeader', () => {
  it('should have report contact button', () => {
    const { getByRole } = render(<StepHeader block={block} />)
    fireEvent.click(getByRole('button'))

    expect(
      getByRole('menuitem', { name: 'Report this content' })
    ).toHaveAttribute(
      'href',
      'mailto:support@nextstep.is?subject=Report%20Journey:%20&body=I want to report journey (your.nextstep.is/) because ...'
    )
  })

  it('should have the terms and conditions link', () => {
    const { getByRole } = render(<StepHeader block={block} />)
    fireEvent.click(getByRole('button'))
    expect(getByRole('link', { name: 'Terms & Conditions' })).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/terms-of-use.html'
    )
  })

  it('should have the privacy policy link', () => {
    const { getByRole } = render(<StepHeader block={block} />)
    fireEvent.click(getByRole('button'))
    expect(getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/privacy.html'
    )
  })
})
