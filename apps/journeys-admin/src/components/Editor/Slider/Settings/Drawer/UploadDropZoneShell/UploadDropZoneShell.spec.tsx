import { render, screen } from '@testing-library/react'

import { UploadDropZoneShell } from './UploadDropZoneShell'

describe('UploadDropZoneShell', () => {
  it('should render children', () => {
    render(
      <UploadDropZoneShell
        isDragAccept={false}
        isActive={false}
        hasError={false}
      >
        <div>child content</div>
      </UploadDropZoneShell>
    )

    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('should forward data-testid to the underlying Box', () => {
    render(
      <UploadDropZoneShell
        data-testid="drop zone"
        isDragAccept={false}
        isActive={false}
        hasError={false}
      >
        <div>child</div>
      </UploadDropZoneShell>
    )

    expect(screen.getByTestId('drop zone')).toBeInTheDocument()
  })

  it('should forward additional props via spread', () => {
    const onClick = jest.fn()
    render(
      <UploadDropZoneShell
        data-testid="drop zone"
        isDragAccept={false}
        isActive={false}
        hasError={false}
        onClick={onClick}
        role="button"
      >
        <div>child</div>
      </UploadDropZoneShell>
    )

    const box = screen.getByTestId('drop zone')
    expect(box).toHaveAttribute('role', 'button')
    box.click()
    expect(onClick).toHaveBeenCalled()
  })

  it('should merge caller sx with shell sx without dropping shell defaults', () => {
    render(
      <UploadDropZoneShell
        data-testid="drop zone"
        isDragAccept={false}
        isActive={false}
        hasError={false}
        sx={{ mt: 10 }}
      >
        <div>child</div>
      </UploadDropZoneShell>
    )

    const box = screen.getByTestId('drop zone')
    expect(box).toHaveStyle({ display: 'flex' })
    expect(box).toHaveStyle({ marginTop: '80px' })
  })
})
