import { render } from '@testing-library/react'
import { defaultTemplate } from './TemplateListData'
import { TemplateList } from '.'

describe('TemplateList', () => {
  it('should render templates', () => {
    const { getByText } = render(<TemplateList templates={[defaultTemplate]} />)
    expect(getByText('Default Template Heading')).toBeInTheDocument()
  })
})
