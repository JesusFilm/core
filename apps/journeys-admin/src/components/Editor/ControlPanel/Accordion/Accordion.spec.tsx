import { fireEvent, render } from '@testing-library/react'

import { ThemeProvider } from '../../../ThemeProvider'

import { Button } from '.'

describe('Button', () => {
  it('should render button', () => {
    const { getByText } = render(
      <Button
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

  it('should render empty value button', () => {
    const { getByText } = render(
      <Button icon={<>test</>} name="name" value="" description="description" />
    )
    expect(getByText('None')).toBeInTheDocument()
  })

  it('selects attribute', () => {
    const handleClick = jest.fn()
    const { getByRole, baseElement, rerender } = render(
      <ThemeProvider>
        <Button
          icon={<>test</>}
          name="name"
          value="value"
          description="description"
          onClick={handleClick}
        />
      </ThemeProvider>
    )
    expect(baseElement.getElementsByTagName('hr')[0]).toHaveStyle(
      'border-color: #dedfe0'
    )
    fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
    rerender(
      <ThemeProvider>
        <Button
          icon={<>test</>}
          name="name"
          value="value"
          description="description"
          onClick={handleClick}
          selected
        />
      </ThemeProvider>
    )
    expect(baseElement.getElementsByTagName('hr')[0]).toHaveStyle(
      'border-color: #c52d3a'
    )
  })
})
