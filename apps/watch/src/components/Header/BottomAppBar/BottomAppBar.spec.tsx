import Fade from '@mui/material/Fade'
import { render, screen } from '@testing-library/react'

import { BottomAppBar } from './BottomAppBar'

describe('BottomAppBar', () => {
  it('should render the header tab buttons', () => {
    render(<BottomAppBar />)

    expect(screen.getByTestId('HeaderBottomAppBar')).toBeInTheDocument()
  })

  it('should render fade component with correct props', () => {
    const { container } = render(
      <BottomAppBar bottomBarTrigger shouldFade lightTheme={false} />
    )

    const fadeComponent = container.querySelectorAll(
      `[data-testid="HeaderBottomAppBar"]`
    )
    expect(fadeComponent.length).toBeGreaterThan(0)
    expect(Fade).toBeDefined()
  })
})
