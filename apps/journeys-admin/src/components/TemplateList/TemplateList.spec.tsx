import { render } from '@testing-library/react'
import { templatesData } from './TemplateListData'
import { TemplateList } from '.'

describe('TemplateList', () => {
  it('should render templates', () => {
    const { getByText } = render(<TemplateList templates={templatesData} />)
    expect(getByText('Default Journey')).toBeInTheDocument()
    expect(getByText('Another Journey')).toBeInTheDocument()
    expect(getByText('Test Journey')).toBeInTheDocument()
  })
})
