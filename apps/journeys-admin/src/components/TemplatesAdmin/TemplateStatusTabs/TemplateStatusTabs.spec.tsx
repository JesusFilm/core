import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { NextRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import {
  defaultTemplate,
  oldTemplate,
  descriptiveTemplate,
  publishedTemplate
} from '../../TemplateList/TemplateListData'
import { ThemeProvider } from '../../ThemeProvider'
import { TemplateStatusTabs } from './TemplateStatusTabs'
import { GET_ACTIVE_PUBLISHER_TEMPLATES } from './ActiveTemplates/ActiveTemplates'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('TemplateStatusTabs', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))
  it('should render template cards', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ACTIVE_PUBLISHER_TEMPLATES
            },
            result: {
              data: {
                journeys: [
                  defaultTemplate,
                  oldTemplate,
                  descriptiveTemplate,
                  publishedTemplate
                ]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TemplateStatusTabs event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('template-card')).toHaveLength(4)
    )
  })

  it('should disable tab when waiting for journeys to load', () => {
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <TemplateStatusTabs event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Active' })).toBeDisabled()
  })

  it('should not change tab if clicking a already selected tab', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ACTIVE_PUBLISHER_TEMPLATES
            },
            result: {
              data: {
                journeys: [defaultTemplate]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TemplateStatusTabs event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Active' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    fireEvent.click(getByRole('tab', { name: 'Active' }))
    expect(getByRole('tab', { name: 'Active' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should show active tab on default', () => {
    const router = {
      query: {
        tab: undefined
      }
    } as unknown as NextRouter

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ACTIVE_PUBLISHER_TEMPLATES
            },
            result: {
              data: {
                journeys: [defaultTemplate]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TemplateStatusTabs router={router} event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Active' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should set active tab based on url query params', () => {
    const router = {
      query: {
        tab: 'active'
      }
    } as unknown as NextRouter

    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_ACTIVE_PUBLISHER_TEMPLATES
              },
              result: {
                data: {
                  journeys: [defaultTemplate]
                }
              }
            }
          ]}
        >
          <ThemeProvider>
            <TemplateStatusTabs router={router} event="" />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tab', { name: 'Active' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})
