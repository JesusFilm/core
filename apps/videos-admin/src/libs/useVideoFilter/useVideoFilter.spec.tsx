import { renderHook } from '@testing-library/react'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { type MockedFunction } from 'vitest'

import { reducer, useVideoFilter } from './useVideoFilter'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn()
}))

const mockUseSearchParams = useSearchParams as MockedFunction<
  typeof useSearchParams
>

describe('useVideoFilter', () => {
  it('should return default state values', () => {
    const search = new URLSearchParams() as ReadonlyURLSearchParams

    mockUseSearchParams.mockReturnValue(search)

    const { result } = renderHook(useVideoFilter)
    expect(result.current.filters).toStrictEqual({
      limit: 50,
      offset: 0,
      showSnippet: true,
      showTitle: true,
      where: {}
    })
    expect(result.current.tableFilterProps).toStrictEqual({
      filterModel: {
        items: []
      },
      paginationModel: { pageSize: 50, page: 0 },
      columnVisibilityModel: {
        locked: true,
        id: true,
        title: true,
        description: true,
        published: true
      },
      pageSizeOptions: [50],
      whereArgs: {}
    })
  })

  it('should return initial state based on query params', () => {
    const search = new URLSearchParams(
      'filters[id][equals]=11_Advent&filters[title][equals]=Jesus&filters[published][is]=false&columns[title]=false&limit=10&page=2'
    ) as ReadonlyURLSearchParams

    mockUseSearchParams.mockReturnValue(search)

    const { result } = renderHook(useVideoFilter)

    expect(result.current.filters).toStrictEqual({
      limit: 10,
      offset: 20,
      showSnippet: true,
      showTitle: false,
      where: {
        ids: ['11_Advent'],
        title: 'Jesus',
        published: false
      }
    })
    expect(result.current.tableFilterProps).toStrictEqual({
      filterModel: {
        items: [
          { field: 'id', operator: 'equals', value: '11_Advent' },
          { field: 'title', operator: 'equals', value: 'Jesus' },
          {
            field: 'published',
            operator: 'is',
            value: false
          }
        ]
      },
      paginationModel: { pageSize: 10, page: 2 },
      columnVisibilityModel: {
        locked: true,
        id: true,
        title: false,
        description: true,
        published: true
      },
      pageSizeOptions: [10],
      whereArgs: {
        ids: ['11_Advent'],
        published: false,
        title: 'Jesus'
      }
    })
  })

  describe('malformed query params', () => {
    function renderWithSearch(query: string) {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams(query) as ReadonlyURLSearchParams
      )

      return renderHook(useVideoFilter)
    }

    it('should ignore a filter nested too deeply without discarding valid filters', () => {
      const { result } = renderWithSearch(
        'filters[title][equals][nested]=oops&filters[published][is]=true'
      )

      expect(result.current.filters.where).toStrictEqual({ published: true })
      expect(result.current.tableFilterProps.filterModel).toStrictEqual({
        items: [{ field: 'published', operator: 'is', value: true }]
      })
    })

    it('should ignore a filter given as a scalar without discarding valid filters', () => {
      const { result } = renderWithSearch(
        'filters[id]=oops&filters[title][equals]=Jesus'
      )

      expect(result.current.filters.where).toStrictEqual({ title: 'Jesus' })
      expect(result.current.tableFilterProps.filterModel).toStrictEqual({
        items: [{ field: 'title', operator: 'equals', value: 'Jesus' }]
      })
    })

    it('should ignore a filter using an unknown operator without discarding valid filters', () => {
      const { result } = renderWithSearch(
        'filters[locked][contains]=true&filters[published][is]=false'
      )

      expect(result.current.filters.where).toStrictEqual({ published: false })
      expect(result.current.tableFilterProps.filterModel).toStrictEqual({
        items: [{ field: 'published', operator: 'is', value: false }]
      })
    })

    it('should drop every filter when all of them are malformed', () => {
      const { result } = renderWithSearch(
        'filters[locked]=1&filters[id]=2&filters[title]=3&filters[published]=4'
      )

      expect(result.current.filters.where).toStrictEqual({})
      expect(result.current.tableFilterProps.filterModel).toStrictEqual({
        items: []
      })
    })

    it('should ignore unrecognised filter fields', () => {
      const { result } = renderWithSearch(
        'filters[bogus][equals]=oops&filters[title][equals]=Jesus'
      )

      expect(result.current.tableFilterProps.filterModel).toStrictEqual({
        items: [{ field: 'title', operator: 'equals', value: 'Jesus' }]
      })
    })

    it('should drop every filter when filters is not an object', () => {
      const { result } = renderWithSearch('filters=oops')

      expect(result.current.filters.where).toStrictEqual({})
      expect(result.current.tableFilterProps.filterModel).toStrictEqual({
        items: []
      })
    })
  })

  it('should update query params', () => {
    const search = new URLSearchParams() as ReadonlyURLSearchParams

    mockUseSearchParams.mockReturnValue(search)

    window.history.pushState = vi.fn()

    const { result } = renderHook(useVideoFilter)

    result.current.updateQueryParams({ page: 2, columns: { title: false } })

    expect(window.history.pushState).toHaveBeenCalledWith(
      null,
      '',
      '?page=2&columns%5Btitle%5D=false'
    )
  })

  describe('state actions', () => {
    const initialState = {
      paginationModel: { page: 0, pageSize: 50 },
      filterModel: { items: [] },
      columnVisibilityModel: {
        locked: true,
        id: true,
        title: true,
        description: true,
        published: true
      },
      whereArgs: {}
    }

    it('should handle PageChange action', () => {
      expect(
        reducer(initialState, {
          type: 'PageChange',
          model: { page: 1, pageSize: 50 }
        })
      ).toEqual({
        ...initialState,
        paginationModel: {
          page: 1,
          pageSize: 50
        }
      })
    })

    it('should handle ColumnChange action', () => {
      expect(
        reducer(initialState, {
          type: 'ColumnChange',
          model: {
            id: false,
            locked: true,
            title: true,
            description: true,
            published: true
          }
        })
      ).toEqual({
        ...initialState,
        columnVisibilityModel: {
          locked: true,
          id: false,
          title: true,
          description: true,
          published: true
        }
      })
    })

    it('should handle FilterChange action', () => {
      const filterModel = {
        items: [
          { field: 'id', operator: 'equals', value: '11_Advent' },
          { field: 'title', operator: 'equals', value: 'Jesus' },
          { field: 'published', operator: 'is', value: false }
        ]
      }

      expect(
        reducer(initialState, {
          type: 'FilterChange',
          model: filterModel
        })
      ).toEqual({
        ...initialState,
        filterModel: filterModel,
        whereArgs: {
          ids: ['11_Advent'],
          title: 'Jesus',
          published: false
        }
      })
    })
  })
})
