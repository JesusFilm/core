import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import {
  defaultTemplate,
  oldTemplate,
  descriptiveTemplate
} from '../TemplateListData'
import { GetPublicTemplates_journeys as Template } from '../../../../__generated__/GetPublicTemplates'
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
    expect(getByText('English')).toBeInTheDocument()
  })

  it('should show native and local language', () => {
    const { getByText } = render(
      <TemplateCard template={descriptiveTemplate} />
    )
    expect(getByText('普通話 (Chinese, Mandarin)')).toBeInTheDocument()
  })

  it('should show only native language if its the same as local language', () => {
    const template: Template = {
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
    const { getByText } = render(<TemplateCard template={template} />)
    expect(getByText('English')).toBeInTheDocument()
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
    expect(getByText('Draft')).toBeInTheDocument()
    expect(getByRole('button')).toBeInTheDocument()
  })
})
