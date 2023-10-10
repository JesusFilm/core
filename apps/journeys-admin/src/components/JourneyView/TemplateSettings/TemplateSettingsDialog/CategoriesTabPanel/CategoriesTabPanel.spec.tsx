import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'

import { CategoriesTabPanel } from './CategoriesTabPanel'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('CategoriesTabPanel', () => {
  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <CategoriesTabPanel tabValue={1} onChange={onClick} />
      </MockedProvider>
    )

    const checkbox = getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(onClick).toHaveBeenCalled()
  })

  it('is disabled when loading is true', () => {
    const onClick = jest.fn()

    const { getByRole } = render(
      <CategoriesTabPanel tabValue={1} onChange={onClick} />
    )

    const checkbox = getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })
})
