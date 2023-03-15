import { render } from '@testing-library/react'
import { MainPanelHeader } from '.'

describe('MainPanelHeader', () => {
  it('should show title', () => {
    const { getByRole } = render(
      <MainPanelHeader
        title="Page title"
        toolbarStyle={{ variant: 'dense', height: 12 }}
      />
    )
    expect(getByRole('banner')).toHaveTextContent('Page title')
  })

  it('should show back button', () => {
    const { getByRole } = render(
      <MainPanelHeader
        title="Page title"
        backHref="/"
        toolbarStyle={{ variant: 'dense', height: 12 }}
      />
    )
    expect(getByRole('link')).toHaveAttribute('href', '/')
  })

  it('should show custom menu', () => {
    const { getByRole } = render(
      <MainPanelHeader
        title="Page title"
        menu={<>Custom Content</>}
        toolbarStyle={{ variant: 'dense', height: 12 }}
      />
    )
    expect(getByRole('banner')).toHaveTextContent('Custom Content')
  })
})
