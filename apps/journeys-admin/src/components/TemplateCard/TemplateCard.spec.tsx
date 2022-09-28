import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import {
  defaultTemplate,
  oldTemplate,
  descriptiveTemplate
} from '../TemplateLibrary/TemplateListData'
import { GetPublishedTemplates_journeys as Journey } from '../../../__generated__/GetPublishedTemplates'
import { TemplateCard } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateCard', () => {
  it('should render', () => {
    const { getByText } = render(<TemplateCard journey={oldTemplate} />)
    expect(getByText('An Old Template Heading')).toBeInTheDocument()
    expect(
      getByText(
        'November 19, 2020 - Template created before the current year should also show the year in the date'
      )
    ).toBeInTheDocument()
    expect(getByText('English')).toBeInTheDocument()
  })

  it('should show native and local language', () => {
    const { getByText } = render(<TemplateCard journey={descriptiveTemplate} />)
    expect(getByText('普通話 (Chinese, Mandarin)')).toBeInTheDocument()
  })

  it('should show only native language if its the same as local language', () => {
    const template: Journey = {
      ...defaultTemplate,
      language: {
        __typename: 'Language',
        id: '529',
        name: [
          {
            __typename: 'Translation',
            value: 'English',
            primary: true
          },
          {
            __typename: 'Translation',
            value: 'English',
            primary: false
          }
        ]
      }
    }
    const { getByText } = render(<TemplateCard journey={template} />)
    expect(getByText('English')).toBeInTheDocument()
  })

  it('should link to template details', () => {
    const { getByRole } = render(<TemplateCard journey={defaultTemplate} />)
    expect(getByRole('link')).toHaveAttribute('href', '/templates/template-id')
  })

  it('should link to publisher template details', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TemplateCard journey={defaultTemplate} isPublisher />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('link')).toHaveAttribute('href', '/publisher/template-id')
  })
})
