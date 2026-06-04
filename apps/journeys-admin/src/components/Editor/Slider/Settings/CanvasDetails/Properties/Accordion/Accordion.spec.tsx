import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { TestEditorState } from '../../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { Accordion } from '.'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('accordion', () => {
  const push = vi.fn()
  const on = vi.fn()

  beforeEach(() => vi.clearAllMocks())

  it('selects accordion', () => {
    render(
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
      screen.queryByText('selectedAttributeId: custom-id')
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(
      screen.getByText('selectedAttributeId: custom-id')
    ).toBeInTheDocument()
  })

  it('handles params in helpscout', () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
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

    fireEvent.click(screen.getByRole('button'))
    expect(
      screen.getByText('selectedAttributeId: custom-id')
    ).toBeInTheDocument()
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'test-params' }
      },
      undefined,
      { shallow: true }
    )
    fireEvent.click(screen.getByRole('button'))
    expect(
      screen.queryByText('selectedAttributeId: custom-id')
    ).not.toBeInTheDocument()
  })

  it('should render a single label if value is null', () => {
    render(
      <ThemeProvider>
        <EditorProvider initialState={{}}>
          <Accordion
            id="custom-id"
            icon={<>test</>}
            name="name"
            param="test-params"
          >
            test
          </Accordion>
          <TestEditorState />
        </EditorProvider>
      </ThemeProvider>
    )

    const summary = screen.getByTestId('AccordionSummary')

    expect(within(summary).getByText('name')).toBeInTheDocument()
    expect(within(summary).queryAllByRole('paragraph')).toHaveLength(1)
  })
})
