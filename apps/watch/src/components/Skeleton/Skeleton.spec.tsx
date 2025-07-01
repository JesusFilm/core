import { render } from '@testing-library/react'

import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('should render with default props', () => {
    const { container } = render(<Skeleton />)
    const skeletonElement = container.firstChild as HTMLElement
    expect(skeletonElement).toBeInTheDocument()
    expect(skeletonElement).toHaveStyle('width: 5px')
    expect(skeletonElement).toHaveStyle('height: 5px')
    expect(skeletonElement.className).toContain('rounded-lg')
    expect(skeletonElement.className).toContain('animate-pulse')
    expect(skeletonElement.className).toContain('bg-text-secondary')
  })

  it('should render with custom height and width', () => {
    const { container } = render(<Skeleton height={100} width={200} />)
    const skeletonElement = container.firstChild as HTMLElement
    expect(skeletonElement).toBeInTheDocument()
    expect(skeletonElement).toHaveStyle('width: 200px')
    expect(skeletonElement).toHaveStyle('height: 100px')
  })

  it('should render with custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    const skeletonElement = container.firstChild as HTMLElement
    expect(skeletonElement).toBeInTheDocument()
    expect(skeletonElement.className).toContain('custom-class')
    expect(skeletonElement).toHaveStyle('width: 5px')
    expect(skeletonElement).toHaveStyle('height: 5px')
  })
})
