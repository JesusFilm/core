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

  it('should render Featured and New templates if tagIds are not present', () => {
    const { getByRole, queryByRole } = render(
      <MockedProvider>
        <TemplateSections />
      </MockedProvider>
    )
    expect(getByRole('heading', { name: 'Featured & New' })).toBeInTheDocument()
    expect(queryByRole('heading', { name: 'Tag Ids' })).not.toBeInTheDocument()
  })

  it('should render relevant templates if tagIds are present', () => {
    mockUseRouter.mockReturnValue({
      query: { tags: ['tagId1', 'tagId2'] }
    } as unknown as NextRouter)

    const { getByRole, getByText } = render(
      <MockedProvider>
        <TemplateSections />
      </MockedProvider>
    )
    // replace with checking most relevant templates
    expect(getByRole('heading', { name: 'Tag Ids' })).toBeInTheDocument()
    expect(getByText('tagId1')).toBeInTheDocument()
    expect(getByText('tagId2')).toBeInTheDocument()
  })
})
