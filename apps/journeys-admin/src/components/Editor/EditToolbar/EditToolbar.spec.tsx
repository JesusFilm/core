import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetCustomDomains } from '../../../../__generated__/GetCustomDomains'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { CustomDomainProvider } from '../../CustomDomainProvider'

import { EditToolbar } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Edit Toolbar', () => {
  it('should render Toolbar', () => {
    const { getAllByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EditToolbar />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getAllByRole('button', { name: 'Delete Block Actions' })[0]
    ).toContainElement(getByTestId('Trash2Icon'))
    expect(
      getAllByRole('button', { name: 'Edit Journey Actions' })[0]
    ).toContainElement(getByTestId('MoreIcon'))
  })

  it('should render analytics button', () => {
    const { getByLabelText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                slug: 'untitled-journey',
                tags: []
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditToolbar />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByLabelText('Analytics')).toBeInTheDocument()
  })

  it('should render Preview Button with custom domain link', () => {
    const { getAllByRole, getAllByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <CustomDomainProvider
            value={{
              customDomains: {
                customDomains: [
                  {
                    __typename: 'CustomDomain' as const,
                    name: 'mockdomain.com',
                    apexName: 'mockdomain.com',
                    id: 'customDomainId',
                    verification: {
                      __typename: 'CustomDomainVerification' as const,
                      verified: true,
                      verification: []
                    }
                  }
                ]
              } as unknown as GetCustomDomains
            }}
          >
            <JourneyProvider
              value={{
                journey: {
                  slug: 'untitled-journey',
                  tags: []
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditToolbar />
            </JourneyProvider>
          </CustomDomainProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    const button = getAllByRole('link', { name: 'Preview' })[0]
    expect(button).toContainElement(getAllByTestId('EyeOpenIcon')[0])
    expect(button).toHaveAttribute(
      'href',
      '/api/preview?slug=untitled-journey&hostname=mockdomain.com'
    )
    expect(button).toHaveAttribute('target', '_blank')
    expect(button).not.toBeDisabled()
  })

  it('should render Preview Button', () => {
    const { getAllByRole, getAllByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <CustomDomainProvider
            value={{
              customDomains: {
                customDomains: []
              }
            }}
          >
            <JourneyProvider
              value={{
                journey: {
                  slug: 'untitled-journey',
                  tags: []
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditToolbar />
            </JourneyProvider>
          </CustomDomainProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    const button = getAllByRole('link', { name: 'Preview' })[0]
    expect(button).toContainElement(getAllByTestId('EyeOpenIcon')[0])
    expect(button).toHaveAttribute(
      'href',
      '/api/preview?slug=untitled-journey&hostname=undefined'
    )
    expect(button).toHaveAttribute('target', '_blank')
    expect(button).not.toBeDisabled()
  })

  it('should disable duplicate button when active journey content is not canvas', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                slug: 'untitled-journey',
                tags: []
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                journeyEditContentComponent: ActiveJourneyEditContent.Action
              }}
            >
              <EditToolbar />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getByRole('button', { name: 'Duplicate Block Actions' })
    ).toBeDisabled()
  })

  it('should disable duplicate button when selectedBlock is a video block', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                slug: 'untitled-journey',
                tags: []
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                selectedBlock: {
                  __typename: 'VideoBlock'
                } as unknown as TreeBlock<VideoBlock>
              }}
            >
              <EditToolbar />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getByRole('button', { name: 'Duplicate Block Actions' })
    ).toBeDisabled()
  })
})
