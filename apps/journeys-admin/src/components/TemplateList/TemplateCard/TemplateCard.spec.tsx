import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { defaultTemplate, oldTemplate } from '../TemplateListData'
import { TemplateCard } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateCard', () => {
  it('should render', () => {
    const { getByText } = render(<TemplateCard template={oldTemplate} />)
    expect(getByText('An Old Template Heading')).toBeInTheDocument()
    expect(
      getByText(
        'November 19, 2020 - Template created before the current year should also show the year in the date'
      )
    ).toBeInTheDocument()
  })

  it('should link to template details', () => {
    const { getByRole } = render(<TemplateCard template={defaultTemplate} />)
    expect(getByRole('link')).toHaveAttribute('href', '/templates/template-id')
  })

  it('should render in admin mode', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TemplateCard template={defaultTemplate} admin={true} />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
    expect(getByRole('button')).toBeInTheDocument()
  })
})
