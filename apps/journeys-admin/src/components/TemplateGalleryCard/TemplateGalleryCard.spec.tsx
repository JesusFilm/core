import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  defaultTemplate,
  oldTemplate
} from '../TemplateLibrary/TemplateListData'

import { TemplateGalleryCard } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateGalleryCard', () => {
  it('should render Template Gallery Card', () => {
    const { getByText } = render(<TemplateGalleryCard journey={oldTemplate} />)
    expect(getByText('November 19, 2020 ● English')).toBeInTheDocument()
    expect(getByText('An Old Template Heading')).toBeInTheDocument()
    expect(
      getByText(
        'Template created before the current year should also show the year in the date'
      )
    ).toBeInTheDocument()
  })

  it('should link to template details', () => {
    const { getByRole } = render(
      <TemplateGalleryCard journey={defaultTemplate} />
    )
    expect(getByRole('link')).toHaveAttribute('href', '/templates/template-id')
  })

  it('should link to publisher template details', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TemplateGalleryCard journey={defaultTemplate} isPublisher />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('link')).toHaveAttribute('href', '/publisher/template-id')
  })
})
