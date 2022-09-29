import { render } from '@testing-library/react'
import { defaultTemplate } from './TemplateListData'
import { TemplateLibrary } from '.'

describe('TemplateLibrary', () => {
  it('should render templates', () => {
    const { getByText } = render(
      <TemplateLibrary journeys={[defaultTemplate]} />
    )
    expect(getByText('Default Template Heading')).toBeInTheDocument()
  })
})
