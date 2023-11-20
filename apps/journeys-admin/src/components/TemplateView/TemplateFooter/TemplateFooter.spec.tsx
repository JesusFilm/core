import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journey } from '../../Editor/ActionDetails/data'

import { TemplateFooter } from './TemplateFooter'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => ({ t: (str: string) => str })
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateFooter', () => {
  it('should render', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <TemplateFooter />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      getByText('Use this template to make it your journey')
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Use This Template' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Use This Template' })
    ).not.toBeDisabled()
  })

  it('should disable when loading', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{}}>
          <TemplateFooter />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Use This Template' })).toBeDisabled()
  })
})
