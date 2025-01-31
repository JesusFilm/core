import { render, screen } from '@testing-library/react'

import { StepBlockNodeIcon } from '.'

describe('StepBlockNodeIcon', () => {
  it('should render default', () => {
    render(<StepBlockNodeIcon typename="IconBlock" />)

    expect(screen.getByTestId('FlexAlignBottom1Icon')).toBeInTheDocument()
  })

  it('should render video icon', () => {
    render(<StepBlockNodeIcon typename="VideoBlock" />)

    expect(screen.getByTestId('Play3Icon')).toBeInTheDocument()
  })

  it('should render image icon', () => {
    render(<StepBlockNodeIcon typename="ImageBlock" />)

    expect(screen.getByTestId('Image3Icon')).toBeInTheDocument()
  })

  it('should render text response icon', () => {
    render(<StepBlockNodeIcon typename="TextResponseBlock" />)

    expect(screen.getByTestId('TextInput1Icon')).toBeInTheDocument()
  })

  it('should render button icon', () => {
    render(<StepBlockNodeIcon typename="ButtonBlock" />)

    expect(screen.getByTestId('Cursor6Icon')).toBeInTheDocument()
  })

  it('should render typography icon', () => {
    render(<StepBlockNodeIcon typename="TypographyBlock" />)

    expect(screen.getByTestId('AlignCenterIcon')).toBeInTheDocument()
  })

  it('should render signup icon', () => {
    render(<StepBlockNodeIcon typename="SignUpBlock" />)

    expect(screen.getByTestId('Mail1Icon')).toBeInTheDocument()
  })

  it('should render radio question icon', () => {
    render(<StepBlockNodeIcon typename="RadioQuestionBlock" />)

    expect(screen.getByTestId('GitBranchIcon')).toBeInTheDocument()
  })

  it('should render icon for multiple blocks', () => {
    render(<StepBlockNodeIcon typename="ButtonBlock" showMultiIcon />)

    expect(screen.getByTestId('GitBranchIcon')).toBeInTheDocument()
  })
})
