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
  it('calls handleChange on click', () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <FeaturedCheckbox
        loading={false}
        values={false}
        name="test"
        onChange={handleChange}
      />
    )

    const checkbox = getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(handleChange).toHaveBeenCalled()
  })

  it('is disabled when loading is true', () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <FeaturedCheckbox
        loading
        values={false}
        name="test"
        onChange={handleChange}
      />
    )

    const checkbox = getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })
})
