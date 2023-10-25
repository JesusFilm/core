import { fireEvent, render } from '@testing-library/react'

import { FeaturedCheckbox } from './FeaturedCheckbox'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('FeaturedCheckbox', () => {
  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <FeaturedCheckbox
        loading={false}
        value={false}
        name="test"
        onChange={onClick}
      />
    )

    const checkbox = getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(onClick).toHaveBeenCalled()
  })

  it('is disabled when loading is true', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <FeaturedCheckbox loading value={false} name="test" onChange={onClick} />
    )

    const checkbox = getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })
})
