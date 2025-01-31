import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { ActiveContent, EditorProvider } from '@core/journeys/ui/EditorProvider'

import { Content } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => false)
}))

describe('Content', () => {
  it('should render social preview', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ activeContent: ActiveContent.Social }}>
          <Content />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('SocialPreview')).toBeInTheDocument()
  })

  it('should render goals', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ activeContent: ActiveContent.Goals }}>
          <Content />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('Goals')).toBeInTheDocument()
  })

  it('should render canvas', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ activeContent: ActiveContent.Canvas }}>
          <Content />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('EditorCanvas')).toBeInTheDocument()
  })
})
