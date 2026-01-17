import { render, screen } from '@testing-library/react'

import { InfoIcon } from './InfoIcon'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}))

describe('InfoIcon', () => {
  it('should render the information icon', () => {
    render(<InfoIcon />)

    expect(
      screen.getByTestId('InformationCircleContainedIcon')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Rows and columns with zero activity are hidden'
      })
    ).toBeInTheDocument()
  })
})
