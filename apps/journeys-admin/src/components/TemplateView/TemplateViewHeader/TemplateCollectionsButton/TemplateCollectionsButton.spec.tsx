import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyFields_tags as Tag } from '../../../../../__generated__/JourneyFields'

import { TemplateCollectionsButton } from './TemplateCollectionsButton'
import { NextRouter, useRouter } from 'next/router'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TemplateCollectionsButton', () => {
  const mockTag: Tag = {
    __typename: 'Tag',
    id: 'a6b0080c-d2a5-4b92-945a-8e044c743139',
    parentId: 'eff2c8a5-64d3-4f20-916d-270ff9ad5813',
    name: [
      {
        __typename: 'Translation',
        value: 'Jesus Film',
        language: {
          __typename: 'Language',
          id: '529'
        },
        primary: true
      }
    ]
  }
  let push: jest.Mock
  beforeEach(() => {
    push = jest.fn()

    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)
  })

  it('should redirect user to templates page with tagId of collection', async () => {
    mockUseRouter.mockReturnValue({
      push
    } as unknown as NextRouter)
    const { getByRole } = render(<TemplateCollectionsButton tag={mockTag} />)

    fireEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname: '/templates',
        query: { tagIds: 'a6b0080c-d2a5-4b92-945a-8e044c743139' }
      })
    )
  })
})
