import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { ThemeProvider } from '../../ThemeProvider'
import {
  defaultTemplate,
  descriptiveTemplate,
  fakeDate,
  oldTemplate
} from '../data'

import { TemplateListItem } from '.'

const userRoleMock = {
  request: {
    query: GET_USER_ROLE
  },
  result: {
    data: {
      getUserRole: {
        id: 'user-id',
        roles: []
      }
    }
  }
}

describe('TemplateListItem', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(fakeDate))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should render', () => {
    const { getByText } = render(
      <MockedProvider mocks={[userRoleMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TemplateListItem journey={oldTemplate} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('An Old Template Heading')).toBeInTheDocument()
    expect(getByText('1 year ago')).toBeInTheDocument()
    expect(
      getByText(
        '- Template created before the current year should also show the year in the date'
      )
    ).toBeInTheDocument()
    expect(getByText('English')).toBeInTheDocument()
  })

  it('should show native and local language', () => {
    const { getByText } = render(
      <MockedProvider mocks={[userRoleMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TemplateListItem journey={descriptiveTemplate} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
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
            __typename: 'LanguageName',
            value: 'English',
            primary: true
          },
          {
            __typename: 'LanguageName',
            value: 'English',
            primary: false
          }
        ]
      }
    }
    const { getByText } = render(
      <MockedProvider mocks={[userRoleMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TemplateListItem journey={template} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })

  it('should link to template details', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[userRoleMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TemplateListItem journey={defaultTemplate} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('link')).toHaveAttribute('href', '/publisher/template-id')
  })
})
