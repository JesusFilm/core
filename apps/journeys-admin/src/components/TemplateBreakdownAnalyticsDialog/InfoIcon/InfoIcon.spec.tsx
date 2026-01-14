import { render, screen } from '@testing-library/react'

import { InfoIcon } from './InfoIcon'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}))

describe('HelpIcon', () => {
  it('should render the information icon', () => {
    render(<InfoIcon />)

    expect(
      screen.getByTestId('InformationCircleContainedIcon')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Only journeys with non-zero activity are shown'
      })
    ).toBeInTheDocument()
  })
})
