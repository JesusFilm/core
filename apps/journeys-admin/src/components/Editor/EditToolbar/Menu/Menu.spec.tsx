import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../__generated__/GetJourney'
import { JourneyStatus, Role } from '../../../../../__generated__/globalTypes'
import { defaultJourney } from '../../../JourneyView/data'
import { TeamProvider } from '../../../Team/TeamProvider'
import { ThemeProvider } from '../../../ThemeProvider'

import { GET_ROLE } from './Menu'

import { Menu } from '.'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('EditToolbar Menu', () => {
  const originalEnv = process.env

  it('should disable duplicate button when video block is selected', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                status: JourneyStatus.draft
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
              <Menu />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Edit Journey Actions' }))
    expect(getByRole('menuitem', { name: 'Duplicate Block' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  describe('desktop', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should open the block menu on icon click', () => {
      const selectedBlock: TreeBlock<TypographyBlock> = {
        id: 'typography0.id',
        __typename: 'TypographyBlock',
        parentBlockId: 'card1.id',
        parentOrder: 0,
        content: 'Title',
        variant: null,
        color: null,
        align: null,
        children: []
      }

      const { getByRole, getByTestId, queryByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  status: JourneyStatus.draft
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      expect(getByRole('button')).toContainElement(getByTestId('MoreVertIcon'))
      fireEvent.click(getByRole('button'))
      expect(getByRole('menu')).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
      expect(
        getByRole('menuitem', { name: 'Delete Block' })
      ).toBeInTheDocument()
      expect(
        queryByRole('menuitem', { name: 'Social Settings' })
      ).not.toBeInTheDocument()
    })

    it('should open the card menu on icon click', () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }

      const { getByRole, getByTestId, queryByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  status: JourneyStatus.draft
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      expect(getByRole('button')).toContainElement(getByTestId('MoreVertIcon'))
      fireEvent.click(getByRole('button'))
      expect(getByRole('menu')).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
      expect(
        queryByRole('menuitem', { name: 'Social Settings' })
      ).not.toBeInTheDocument()
    })

    it('should link back to journey on click', () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }

      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  slug: 'my-journey'
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )

      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Journey Settings' })
      ).toHaveAttribute('href', '/journeys/journeyId')
    })

    it('should link back to publisher page on click', () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }

      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  slug: 'my-journey',
                  template: true
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )

      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Publisher Settings' })
      ).toHaveAttribute('href', '/publisher/journeyId')
    })
  })

  describe('mobile', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should display opens social share drawer when card is selected', () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }

      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  status: JourneyStatus.draft
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <ThemeProvider>
                  <Menu />
                </ThemeProvider>
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Social Settings' })
      ).toBeInTheDocument()

      fireEvent.click(getByRole('menuitem', { name: 'Social Settings' }))
      expect(getByText('Social Settings')).toBeInTheDocument()
    })

    it('should display and opens social share drawer when block is selected', () => {
      const selectedBlock: TreeBlock<TypographyBlock> = {
        id: 'typography0.id',
        __typename: 'TypographyBlock',
        parentBlockId: 'card1.id',
        parentOrder: 0,
        content: 'Title',
        variant: null,
        color: null,
        align: null,
        children: []
      }

      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  status: JourneyStatus.draft
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <ThemeProvider>
                  <Menu />
                </ThemeProvider>
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Social Settings' })
      ).toBeInTheDocument()

      fireEvent.click(getByRole('menuitem', { name: 'Social Settings' }))
      expect(getByText('Social Settings')).toBeInTheDocument()
    })
  })

  describe('TitleDescriptionMenuItem', () => {
    it('should handle edit journey title and description if user is publisher', async () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_ROLE
                },
                result: {
                  data: {
                    getUserRole: {
                      id: 'userRoleId',
                      userId: '1',
                      roles: [Role.publisher]
                    }
                  }
                }
              }
            ]}
          >
            <TeamProvider>
              <JourneyProvider
                value={{
                  journey: { ...defaultJourney, template: true },
                  variant: 'admin'
                }}
              >
                <Menu />
              </JourneyProvider>
            </TeamProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      const menu = getByRole('button')
      fireEvent.click(menu)
      await waitFor(() => {
        fireEvent.click(getByRole('menuitem', { name: 'Description' }))
        expect(getByRole('dialog')).toBeInTheDocument()
      })
    })
  })

  describe('TitleMenuItem', () => {
    it('should handle edit title', () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  status: JourneyStatus.draft
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <ThemeProvider>
                <Menu />
              </ThemeProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      const menu = getByRole('button')
      fireEvent.click(menu)
      fireEvent.click(getByRole('menuitem', { name: 'Title' }))
      expect(getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('DescriptionMenuItem', () => {
    it('should handle edit journey description', () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <TeamProvider>
              <JourneyProvider
                value={{
                  journey: defaultJourney,
                  variant: 'admin'
                }}
              >
                <Menu />
              </JourneyProvider>
            </TeamProvider>
          </MockedProvider>
        </SnackbarProvider>
      )

      const menu = getByRole('button')
      fireEvent.click(menu)
      fireEvent.click(getByRole('menuitem', { name: 'Description' }))
      expect(getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('LanguageMenuItem', () => {
    it('should handle edit journey language', async () => {
      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <TeamProvider>
              <JourneyProvider
                value={{
                  journey: defaultJourney,
                  variant: 'admin'
                }}
              >
                <Menu />
              </JourneyProvider>
            </TeamProvider>
          </MockedProvider>
        </SnackbarProvider>
      )

      const menu = getByRole('button')
      fireEvent.click(menu)
      fireEvent.click(getByRole('menuitem', { name: 'Language' }))
      await waitFor(() => {
        expect(getByRole('dialog')).toBeInTheDocument()
        expect(getByText('Edit Language')).toBeInTheDocument()
      })
    })
  })

  describe('CopyMenuItem', () => {
    it('should handle copy url in development', async () => {
      jest.resetModules()
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_JOURNEYS_URL: 'http://localhost:4100'
      }

      jest.spyOn(navigator.clipboard, 'writeText')

      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <TeamProvider>
              <JourneyProvider
                value={{
                  journey: defaultJourney,
                  variant: 'admin'
                }}
              >
                <Menu />
              </JourneyProvider>
            </TeamProvider>
          </MockedProvider>
        </SnackbarProvider>
      )

      const menu = getByRole('button')
      fireEvent.click(menu)
      fireEvent.click(getByRole('menuitem', { name: 'Copy Link' }))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_JOURNEYS_URL as string}/${
          defaultJourney.slug
        }`
      )
      await waitFor(() => {
        expect(getByText('Link Copied')).toBeInTheDocument()
      })
      expect(menu).not.toHaveAttribute('aria-expanded')

      process.env = originalEnv
    })

    it('should handle copy url in production', async () => {
      jest.resetModules()
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_JOURNEYS_URL: undefined
      }

      jest.spyOn(navigator.clipboard, 'writeText')

      const { getByRole, getByText } = render(
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <TeamProvider>
              <JourneyProvider
                value={{
                  journey: defaultJourney,
                  variant: 'admin'
                }}
              >
                <Menu />
              </JourneyProvider>
            </TeamProvider>
          </MockedProvider>
        </SnackbarProvider>
      )

      const menu = getByRole('button')
      fireEvent.click(menu)
      fireEvent.click(getByRole('menuitem', { name: 'Copy Link' }))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `https://your.nextstep.is/${defaultJourney.slug}`
      )
      await waitFor(() => {
        expect(getByText('Link Copied')).toBeInTheDocument()
      })
      expect(menu).not.toHaveAttribute('aria-expanded')

      process.env = originalEnv
    })
  })

  describe('ReportMenuItem', () => {
    it('should handle reports', () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <TeamProvider>
              <JourneyProvider
                value={{
                  journey: defaultJourney,
                  variant: 'admin'
                }}
              >
                <Menu />
              </JourneyProvider>
            </TeamProvider>
          </MockedProvider>
        </SnackbarProvider>
      )

      const menu = getByRole('button')
      fireEvent.click(menu)
      expect(getByRole('menuitem', { name: 'Report' })).toHaveAttribute(
        'href',
        '/journeys/journey-id/reports'
      )
    })
  })
})
