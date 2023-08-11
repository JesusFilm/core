import { fireEvent, render } from '@testing-library/react'

import { StepHeader } from './StepHeader'

describe('StepHeader', () => {
  it('should have report contact button', () => {
    const { getByRole } = render(<StepHeader />)
    fireEvent.click(getByRole('button'))

    expect(
      getByRole('menuitem', { name: 'Report this content' })
    ).toHaveAttribute(
      'href',
      'mailto:support@nextstep.is?subject=Report%20Journey:%20&body=I want to report journey (your.nextstep.is/) because ...'
    )
  })

  it('should have the terms and conditions link', () => {
    const { getByRole } = render(<StepHeader />)
    fireEvent.click(getByRole('button'))
    expect(getByRole('link', { name: 'Terms & Conditions' })).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/terms-of-use.html'
    )
  })

  it('should have the journey creator privacy policy', () => {
    const { getByText, getByRole } = render(<StepHeader />)
    fireEvent.click(getByRole('button'))

    expect(
      getByText(
        'All personal identifiable data registered on this website will be processed by journey creator: "{{ teamTitle }}".'
      )
    ).toBeInTheDocument()
  })

  it('should have the correct line height for journey creator privacy policy', () => {
    const { getByText, getByRole } = render(<StepHeader />)
    fireEvent.click(getByRole('button'))

    expect(
      getByText(
        'All personal identifiable data registered on this website will be processed by journey creator: "{{ teamTitle }}".'
      )
    ).toHaveStyle({ 'line-height': 1.2, display: 'block' })
  })
})
