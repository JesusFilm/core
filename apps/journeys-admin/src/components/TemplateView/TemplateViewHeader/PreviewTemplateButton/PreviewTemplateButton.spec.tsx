import { render } from '@testing-library/react'

import { PreviewTemplateButton } from './PreviewTemplateButton'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('PreviewTemplateButton', () => {
  const originalEnv = process.env
  jest.resetModules()
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_JOURNEYS_URL: 'http://localhost:4100'
  }

  it('should link to api', () => {
    const { getByRole } = render(
      <PreviewTemplateButton slug="template-slug" isPublisher />
    )
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/api/preview?slug=template-slug'
    )
  })

  it('should link journey', () => {
    const { getByRole } = render(<PreviewTemplateButton slug="template-slug" />)
    expect(getByRole('link')).toHaveAttribute(
      'href',
      'http://localhost:4100/template-slug'
    )
  })

  it('should be disabled', () => {
    const { getByRole } = render(<PreviewTemplateButton />)

    expect(getByRole('link')).toHaveAttribute('aria-disabled', 'true')
  })
})
