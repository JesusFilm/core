import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { NextRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from '../journeyListData'
import { ThemeProvider } from '../../ThemeProvider'
import { StatusTabPanel } from './StatusTabPanel'
import { GET_ACTIVE_JOURNEYS } from './ActiveStatusTab/ActiveStatusTab'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('StatusTabPanel', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))
  it('should render journey cards', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ACTIVE_JOURNEYS
            },
            result: {
              data: {
                journeys: [
                  defaultJourney,
                  oldJourney,
                  descriptiveJourney,
                  publishedJourney
                ]
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <ThemeProvider>
            <StatusTabPanel />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')).toHaveLength(4)
    )
  })

  it('should disable tab when waiting for journeys to load', () => {
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <StatusTabPanel />
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
              query: GET_ACTIVE_JOURNEYS
            },
            result: {
              data: {
                journeys: [defaultJourney]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <StatusTabPanel />
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
              query: GET_ACTIVE_JOURNEYS
            },
            result: {
              data: {
                journeys: [defaultJourney]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <StatusTabPanel router={router} />
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
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ACTIVE_JOURNEYS
            },
            result: {
              data: {
                journeys: [defaultJourney]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <StatusTabPanel router={router} />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Active' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})
