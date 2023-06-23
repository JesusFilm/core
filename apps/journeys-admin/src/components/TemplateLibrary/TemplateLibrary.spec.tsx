import { render } from '@testing-library/react'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { defaultTemplate } from './TemplateListData'
import { TemplateLibrary } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))
describe('TemplateLibrary', () => {
  it('should render templates', () => {
    const { getByText } = render(
      <FlagsProvider>
        <TemplateLibrary templates={[defaultTemplate]} />
      </FlagsProvider>
    )
    expect(getByText('Default Template Heading')).toBeInTheDocument()
  })

  it('should show templates to new publishers', () => {
    const { getByText } = render(
      <FlagsProvider>
        <TemplateLibrary templates={[defaultTemplate]} />
      </FlagsProvider>
    )
    expect(getByText('Default Template Heading')).toBeInTheDocument()
  })
})
