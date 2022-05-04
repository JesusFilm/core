import { render } from '@testing-library/react'
import { ExpandedCover } from '.'

describe('ExpandedCover', () => {
  const children = <p>How did we get here?</p>

  const blurUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAABmJLR0QA/wD/AP+gvaeTAAABA0lEQVQokV2RMY4cQQwDi5S69x7hwP9/ngMfPDstOpiFAwcVECAqIPXz60fUxq9F7UWtRlUgmBzuuXnfF3+ui+/r4tcVcgumQIUFiHyA/7OTB0IRXgwk/2h7kEwBxVNWHpMIEMIQDskNOSjFdwQR3Q0YymCLspCFFAJYIAVxkN/IN9JCMr8R7W1k4/WhC7uQgIhocAq30Qh6gMNkCEPr1ciFeuG18VrUR6A55AhrEAdyCHBKdERJNHuBC9ZGe6NeqJoSaAZuM3pGJcNI1ARjpKKzFlTBWrAX6o26EcJzwEKEZPAcDDiDgNh0usFFqqEb1kJVjyB+XjgL1xvXwjMoNxKMzF9Ukn10nay9yQAAAABJRU5ErkJggg=='

  it('should render children', () => {
    const { getByText } = render(<ExpandedCover>{children}</ExpandedCover>)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render background image as blur', () => {
    const { getByTestId } = render(
      <ExpandedCover backgroundBlur={blurUrl}>{children}</ExpandedCover>
    )
    expect(getByTestId('expandedBlurBackground')).toHaveStyle(
      `background-image: url(${blurUrl}), url(${blurUrl})`
    )
  })
})
