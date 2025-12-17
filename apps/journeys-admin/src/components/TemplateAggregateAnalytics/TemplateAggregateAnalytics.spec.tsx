import { render, screen } from '@testing-library/react'

import { TemplateAggregateAnalytics } from './TemplateAggregateAnalytics'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}))

jest.mock('./localizeAndRound', () => ({
  localizeAndRound: () => '0'
}))

describe('TemplateAggregateAnalytics', () => {
  it('should render icons for each metric button', () => {
    render(<TemplateAggregateAnalytics />)

    expect(screen.getByTestId('Data1Icon')).toBeInTheDocument()
    expect(screen.getByTestId('EyeOpenIcon')).toBeInTheDocument()
    expect(screen.getByTestId('Inbox2Icon')).toBeInTheDocument()
  })
})
