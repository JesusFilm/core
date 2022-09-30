import { render } from '@testing-library/react'
import { defaultTemplate } from './TemplateListData'
import { TemplateLibrary } from '.'

describe('TemplateLibrary', () => {
  it('should render templates', () => {
    const { getByText } = render(
      <TemplateLibrary
        journeys={[defaultTemplate]}
        templates={[defaultTemplate]}
      />
    )
    expect(getByText('Default Template Heading')).toBeInTheDocument()
  })

  it('should show access denied message to new user', () => {
    const { getByText } = render(
      <TemplateLibrary journeys={[]} templates={[defaultTemplate]} />
    )
    expect(
      getByText('You need to be invited to create the first template')
    ).toBeInTheDocument()
  })

  it('should show templates to new publishers', () => {
    const { getByText } = render(
      <TemplateLibrary
        isPublisher
        journeys={[]}
        templates={[defaultTemplate]}
      />
    )
    expect(getByText('Default Template Heading')).toBeInTheDocument()
  })
})
