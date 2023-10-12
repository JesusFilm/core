import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

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
        <TemplateFooter />
      </MockedProvider>
    )

    expect(
      getByText('Use this template to make it your journey')
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Use Template' })).toBeInTheDocument()
  })
})
