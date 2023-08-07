import { fireEvent, render } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { ThemeProvider } from '../../../../ThemeProvider'

import { Attribute } from '.'

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
    const handleClick = jest.fn()
    const { getByRole, baseElement } = render(
      <ThemeProvider>
        <EditorProvider>
          <Attribute
            id="custom-id"
            icon={<>test</>}
            name="name"
            value="value"
            description="description"
            onClick={handleClick}
          />
        </EditorProvider>
      </ThemeProvider>
    )
    expect(baseElement.getElementsByTagName('hr')[0]).toHaveStyle(
      'border-color: #dedfe0'
    )
    fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
    expect(baseElement.getElementsByTagName('hr')[0]).toHaveStyle(
      'border-color: #c52d3a'
    )
  })
})
