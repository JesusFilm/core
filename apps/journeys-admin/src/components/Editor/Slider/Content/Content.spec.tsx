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
      <EditorProvider initialState={{ activeContent: ActiveContent.Social }}>
        <Content />
      </EditorProvider>
    )

    expect(screen.getByTestId('SocialPreview')).toBeInTheDocument()
  })

  it('should render goals', () => {
    render(
      <EditorProvider initialState={{ activeContent: ActiveContent.Goals }}>
        <Content />
      </EditorProvider>
    )

    expect(screen.getByTestId('Goals')).toBeInTheDocument()
  })

  it('should render canvas', () => {
    render(
      <EditorProvider initialState={{ activeContent: ActiveContent.Canvas }}>
        <Content />
      </EditorProvider>
    )

    expect(screen.getByTestId('EditorCanvas')).toBeInTheDocument()
  })
})
