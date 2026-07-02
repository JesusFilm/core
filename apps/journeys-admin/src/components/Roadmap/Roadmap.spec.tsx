import { render, screen } from '@testing-library/react'

import { Roadmap, RoadmapItem } from './Roadmap'

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}))

const items: RoadmapItem[] = [
  {
    title: 'Urgent bug fixes',
    order: 1,
    category: 'bug',
    size: 'medium',
    subRow: 0,
    spanToEnd: false,
    status: 'In progress',
    effort: 'Ongoing',
    content:
      'Fixing the highest-impact issues with a [link](https://example.com).'
  },
  {
    title: 'Future product ideas',
    order: 2,
    category: 'feature',
    size: 'small',
    subRow: 0,
    spanToEnd: false,
    status: null,
    effort: null,
    content: 'Early ideas not yet scoped.'
  }
]

describe('Roadmap', () => {
  it('renders the page heading', () => {
    render(<Roadmap items={items} />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Product Roadmap' })
    ).toBeInTheDocument()
  })

  it('renders a heading for each lane', () => {
    render(<Roadmap items={items} />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Bugs & Maintenance' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Feature development' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'AI' })
    ).toBeInTheDocument()
  })

  it('renders each item title', () => {
    render(<Roadmap items={items} />)

    expect(
      screen.getByRole('heading', { level: 3, name: 'Urgent bug fixes' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Future product ideas' })
    ).toBeInTheDocument()
  })

  it('shows an in-progress dot for active work', () => {
    render(<Roadmap items={items} />)

    expect(screen.getByLabelText('In progress')).toBeInTheDocument()
  })

  it('omits the in-progress dot when not active', () => {
    render(<Roadmap items={[items[1]]} />)

    expect(screen.queryByLabelText('In progress')).not.toBeInTheDocument()
  })

  it('renders markdown content, including links', () => {
    render(<Roadmap items={items} />)

    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute(
      'href',
      'https://example.com'
    )
  })
})
