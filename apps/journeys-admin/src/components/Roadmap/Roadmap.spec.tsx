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
    title: 'Make the codebase AI-friendly',
    order: 2,
    category: 'ai',
    size: 'large',
    subRow: 0,
    spanToEnd: false,
    status: 'Done',
    effort: 'Large',
    content: 'Guardrails and navigation aids.'
  },
  {
    title: 'Future product ideas',
    order: 3,
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

  it('shows an amber dot for in-progress work', () => {
    render(<Roadmap items={items} />)

    expect(screen.getByLabelText('In progress')).toHaveStyle({
      backgroundColor: '#ED6C02'
    })
  })

  it('shows a green dot for completed work', () => {
    render(<Roadmap items={items} />)

    expect(screen.getByLabelText('Done')).toHaveStyle({
      backgroundColor: '#2E7D32'
    })
  })

  it('omits the dot for work that is neither done nor active', () => {
    render(<Roadmap items={[items[2]]} />)

    expect(screen.queryByLabelText('In progress')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Done')).not.toBeInTheDocument()
  })

  it('renders markdown content, including links', () => {
    render(<Roadmap items={items} />)

    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute(
      'href',
      'https://example.com'
    )
  })
})
