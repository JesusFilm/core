import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { TemplateSections } from './TemplateSections'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TemplateSections', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      query: {}
    } as unknown as NextRouter)
  })

  it('should render Featured and New templates', () => {
    const { getByRole } = render(
      <MockedProvider>
        <TemplateSections />
      </MockedProvider>
    )
    expect(getByRole('heading', { name: 'Featured & New' })).toBeInTheDocument()
  })

  it('should render Most Relevant Templates when tag Ids are provided', () => {
    mockUseRouter.mockReturnValue({
      query: { tags: ['tagId1'] }
    } as unknown as NextRouter)

    const { getByRole, queryByRole } = render(
      <MockedProvider>
        <TemplateSections />
      </MockedProvider>
    )
    expect(getByRole('heading', { name: 'Most Relevant' })).toBeInTheDocument()
    expect(
      queryByRole('heading', { name: 'Featured & New' })
    ).not.toBeInTheDocument()
  })
})
