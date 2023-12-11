import { render } from '@testing-library/react'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { defaultTemplate, descriptiveTemplate, oldTemplate } from '../data'

import { TemplateListItem } from '.'

describe('TemplateListItem', () => {
  it('should render', () => {
    const { getByText } = render(<TemplateListItem journey={oldTemplate} />)
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
      <TemplateListItem journey={descriptiveTemplate} />
    )
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
    const { getByText } = render(<TemplateListItem journey={template} />)
    expect(getByText('English')).toBeInTheDocument()
  })

  it('should link to template details', () => {
    const { getByRole } = render(<TemplateListItem journey={defaultTemplate} />)
    expect(getByRole('link')).toHaveAttribute('href', '/publisher/template-id')
  })
})
