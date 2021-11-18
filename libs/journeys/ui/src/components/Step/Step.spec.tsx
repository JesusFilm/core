import { render } from '@testing-library/react'
import { TreeBlock } from '../../'
import { StepFields } from './__generated__/StepFields'
import { Step } from '.'

const block: TreeBlock<StepFields> = {
  __typename: 'StepBlock',
  id: 'Step1',
  parentBlockId: null,
  nextBlockId: null,
  locked: false,
  children: [
    {
      __typename: 'ButtonBlock',
      id: 'Button1',
      parentBlockId: 'Step1',
      label: 'Button 1',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIcon: null,
      endIcon: null,
      action: null,
      children: []
    },
    {
      __typename: 'ButtonBlock',
      id: 'Button2',
      parentBlockId: 'Step1',
      label: 'Button 2',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIcon: null,
      endIcon: null,
      action: null,
      children: []
    }
  ]
}

describe('Step', () => {
  it('should render blocks', () => {
    const { getByText } = render(<Step {...block} />)
    expect(getByText('Button 1')).toBeInTheDocument()
    expect(getByText('Button 2')).toBeInTheDocument()
  })

  it('should render empty block', () => {
    const { baseElement } = render(<Step {...block} children={[]} />)
    expect(baseElement).toContainHTML('<body><div /></body>')
  })
})
