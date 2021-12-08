import { render, fireEvent } from '@testing-library/react'
import { EditorProvider } from '../../../Context'
import { Attribute } from '.'
import { ThemeProvider } from '../../../../ThemeProvider'

describe('Attribute', () => {
  it('should render attribute', () => {
    const { getByText } = render(
      <Attribute
        id="custom-id"
        icon={<>test</>}
        name="name"
        value="value"
        description="description"
      />
    )
    expect(getByText('test')).toBeInTheDocument()
    expect(getByText('name')).toBeInTheDocument()
    expect(getByText('value')).toBeInTheDocument()
    expect(getByText('description')).toBeInTheDocument()
  })

  it('selects attribute', () => {
    const { getByRole, baseElement } = render(
      <ThemeProvider>
        <EditorProvider>
          <Attribute
            id="custom-id"
            icon={<>test</>}
            name="name"
            value="value"
            description="description"
          />
        </EditorProvider>
      </ThemeProvider>
    )
    expect(baseElement.getElementsByTagName('hr')[0]).toHaveStyle(
      'border-color: #dcdde5'
    )
    fireEvent.click(getByRole('button'))
    expect(baseElement.getElementsByTagName('hr')[0]).toHaveStyle(
      'border-color: #b62d1c'
    )
  })
})
