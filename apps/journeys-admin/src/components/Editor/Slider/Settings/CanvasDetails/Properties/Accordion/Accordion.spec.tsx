import { fireEvent, render } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { ThemeProvider } from '../../../../../../ThemeProvider'

import { Accordion } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('accordion', () => {
  it('should render accordion', () => {
    const { getByText } = render(
      <Accordion id="custom-id" icon={<>test</>} name="name" value="value">
        test
      </Accordion>
    )
    expect(getByText('test')).toBeInTheDocument()
    expect(getByText('name')).toBeInTheDocument()
    expect(getByText('value')).toBeInTheDocument()
    expect(getByText('description')).toBeInTheDocument()
  })

  it('selects accordion', () => {
    const handleClick = jest.fn()
    const { getByRole, baseElement } = render(
      <ThemeProvider>
        <EditorProvider>
          <Accordion id="custom-id" icon={<>test</>} name="name" value="value">
            test
          </Accordion>
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
