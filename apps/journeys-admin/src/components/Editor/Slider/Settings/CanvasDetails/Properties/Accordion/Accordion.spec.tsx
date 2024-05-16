import { fireEvent, render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { TestEditorState } from '../../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { Accordion } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('accordion', () => {
  const push = jest.fn()
  const on = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('selects accordion', () => {
    const { getByRole, getByText, queryByText } = render(
      <ThemeProvider>
        <EditorProvider initialState={{}}>
          <Accordion id="custom-id" icon={<>test</>} name="name" value="value">
            test
          </Accordion>
          <TestEditorState />
        </EditorProvider>
      </ThemeProvider>
    )
    expect(
      queryByText('selectedAttributeId: custom-id')
    ).not.toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    expect(getByText('selectedAttributeId: custom-id')).toBeInTheDocument()
  })

  it('handles params in helpscout', () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getByRole, getByText, queryByText } = render(
      <ThemeProvider>
        <EditorProvider initialState={{}}>
          <Accordion
            id="custom-id"
            icon={<>test</>}
            name="name"
            value="value"
            param="test-params"
          >
            test
          </Accordion>
          <TestEditorState />
        </EditorProvider>
      </ThemeProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByText('selectedAttributeId: custom-id')).toBeInTheDocument()
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'test-params' }
      },
      undefined,
      { shallow: true }
    )
    fireEvent.click(getByRole('button'))
    expect(
      queryByText('selectedAttributeId: custom-id')
    ).not.toBeInTheDocument()
  })
})
