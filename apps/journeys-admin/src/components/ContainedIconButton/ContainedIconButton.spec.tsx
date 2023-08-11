import { fireEvent, render } from '@testing-library/react'
import noop from 'lodash/noop'

import { ContainedIconButton } from './ContainedIconButton'

describe('ContainedIconButton', () => {
  const onClick = jest.fn()

  it('should render button', async () => {
    const { getByRole } = render(
      <ContainedIconButton label="Label" onClick={noop} />
    )

    expect(getByRole('button')).toHaveTextContent('Label')
  })

  it('should call onClick on button click', () => {
    const { getByRole } = render(
      <ContainedIconButton label="Label" onClick={onClick} />
    )
    fireEvent.click(getByRole('button'))

    expect(onClick).toHaveBeenCalled()
  })

  it('should render description', () => {
    const { getByRole } = render(
      <ContainedIconButton
        label="Label"
        description="testDescription"
        onClick={noop}
      />
    )

    expect(getByRole('button')).toHaveTextContent('testDescription')
  })

  it('should be disabled when loading', () => {
    const { getByRole } = render(
      <ContainedIconButton label="Label" onClick={noop} loading />
    )

    expect(getByRole('button')).toBeDisabled()
  })

  it('should be disabled when disabled', () => {
    const { getByRole } = render(
      <ContainedIconButton label="Label" onClick={noop} disabled />
    )

    expect(getByRole('button')).toBeDisabled()
  })
})
