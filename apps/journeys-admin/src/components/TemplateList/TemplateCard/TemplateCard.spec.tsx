import { render } from '@testing-library/react'
import { TemplateCard } from '.'

describe('TemplateCard', () => {
  it('should render', () => {
    const templateCard = {
      id: '1',
      title: 'Default Journey',
      date: '25 September',
      description: 'A short preview of the description',
      socialShareImage:
        'https://images.unsplash.com/photo-1657299142317-00e647447f80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHw2fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60'
    }

    const { getByText } = render(<TemplateCard template={templateCard} />)
    expect(getByText('Default Journey')).toBeInTheDocument()
  })

  it('should display date and description', () => {})

  it('should open menu', () => {})

  it('should link to template details', () => {})
})
