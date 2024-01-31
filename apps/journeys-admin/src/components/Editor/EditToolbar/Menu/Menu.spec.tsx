import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockDuplicate } from '../../../../../__generated__/BlockDuplicate'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../__generated__/GetJourney'
import { JourneyStatus, Role } from '../../../../../__generated__/globalTypes'
import { BLOCK_DUPLICATE } from '../DuplicateBlock/DuplicateBlock'

import { GET_ROLE } from './Menu'

import { Menu } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('EditToolbar Menu', () => {
  const push = jest.fn()
  const on = jest.fn()

  it('should disable duplicate button when video block is selected', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                status: JourneyStatus.draft,
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

  it('should render menu items', () => {
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
                tags: []
              } as unknown as Journey
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
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Duplicate Card' })
    ).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Title' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Description' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Language' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Analytics' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Copy Link' })).toBeInTheDocument()
  })

  it('should render journey menu items for publishers', async () => {
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
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_ROLE
              },
              result: {
                data: {
                  getUserRole: {
                    id: '1',
                    userId: 'userId',
                    roles: [Role.publisher]
                  }
                }
              }
            }
          ]}
        >
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                slug: 'my-journey',
                tags: []
              } as unknown as Journey
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
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Duplicate Card' })
    ).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Title' })).toBeInTheDocument()
    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Description' })).toBeInTheDocument()
    })
    expect(
      getByRole('menuitem', { name: 'Create Template' })
    ).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Language' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Analytics' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Copy Link' })).toBeInTheDocument()
  })

  it('should render template menu items for publishers', async () => {
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
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_ROLE
              },
              result: {
                data: {
                  getUserRole: {
                    id: '1',
                    userId: 'userId',
                    roles: [Role.publisher]
                  }
                }
              }
            }
          ]}
        >
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                slug: 'my-journey',
                template: true,
                tags: []
              } as unknown as Journey
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
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Duplicate Card' })
    ).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Template Settings' })
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Language' })).toBeInTheDocument()
    })
    expect(getByRole('menuitem', { name: 'Analytics' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Copy Link' })).toBeInTheDocument()
  })

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

    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                status: JourneyStatus.draft,
                tags: []
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
    expect(getByRole('button')).toContainElement(getByTestId('MoreIcon'))
    fireEvent.click(getByRole('button'))
    expect(getByRole('menu')).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Block' })).toBeInTheDocument()
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

    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                status: JourneyStatus.draft,
                tags: []
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
    expect(getByRole('button')).toContainElement(getByTestId('MoreIcon'))
    fireEvent.click(getByRole('button'))
    expect(getByRole('menu')).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
  })

  it('should close the menu upon clicking duplicating from menu', async () => {
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

    const mockBlockDuplicate: MockedResponse<BlockDuplicate> = {
      request: {
        query: BLOCK_DUPLICATE,
        variables: {
          id: selectedBlock.id,
          parentOrder: 1
        }
      },
      result: {
        data: {
          blockDuplicate: [
            {
              __typename: 'TypographyBlock',
              id: 'typography0.id'
            }
          ]
        }
      }
    }

    const { getByTestId, queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[mockBlockDuplicate]}>
          <JourneyProvider
            value={{
              journey: {
                status: JourneyStatus.draft,
                tags: []
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
    expect(queryByRole('menu')).not.toBeInTheDocument()
    fireEvent.click(getByTestId('MoreIcon'))
    await waitFor(() => expect(queryByRole('menu')).toBeInTheDocument())
    fireEvent.click(getByTestId('JourneysAdminMenuItemDuplicate-Block'))
    await waitFor(() => expect(queryByRole('menu')).not.toBeInTheDocument())
    await waitFor(() => expect(mockBlockDuplicate.result).toHaveBeenCalled())
  })

  it('should open templates dialog', async () => {
    const selectedBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'stepId',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      children: []
    }

    const { getByRole, queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                slug: 'my-journey',
                template: true,
                tags: []
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
    expect(
      queryByRole('dialog', { name: 'Template Settings' })
    ).not.toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Template Settings' }))
    await waitFor(() =>
      expect(
        getByRole('dialog', { name: 'Template Settings' })
      ).toBeInTheDocument()
    )
  })

  it('should handle edit journey title', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                slug: 'my-journey',
                tags: []
              } as unknown as Journey
            }}
          >
            <EditorProvider>
              <Menu />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Title' }))
    await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(menu).not.toHaveAttribute('aria-expanded')

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'title' },
          push,
          events: {
            on
          }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should handle edit journey description', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                slug: 'my-journey',
                tags: []
              } as unknown as Journey
            }}
          >
            <EditorProvider>
              <Menu />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Description' }))
    await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(menu).not.toHaveAttribute('aria-expanded')

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'description' },
          push,
          events: {
            on
          }
        },
        undefined,
        { shallow: true }
      )
    })
  })
})
