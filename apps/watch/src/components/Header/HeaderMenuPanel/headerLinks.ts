export interface HeaderLinkSubLink {
  label: string
  url: string
}

export interface HeaderLinkProps {
  label: string
  url?: string
  subLinks?: HeaderLinkSubLink[]
}

export const headerLinks: HeaderLinkProps[] = [
  {
    label: 'About',
    url: '/about/'
  },
  { label: 'Blog', url: '/blog/' },
  {
    label: 'Give',
    subLinks: [
      { label: 'Ways to Give', url: '/give/' },
      { label: 'Why Give', url: '/give/why-give/' },
      {
        label: 'Current Projects',
        url: '/give/ways-to-give/current-projects/'
      },
      {
        label: 'Honors & Memorials',
        url: '/give/ways-to-give/memorials-living-tributes/'
      },
      { label: 'Gift Catalog', url: 'https://giftcatalog.jesusfilm.org/' },
      {
        label: 'Tax Smart Giving',
        url: '/give/ways-to-give/tax-smart-giving/'
      },
      {
        label: 'Financial Accountability',
        url: '/give/accountability/'
      }
    ]
  },
  {
    label: 'Resources',
    subLinks: [
      {
        label: 'Strategies',
        url: '/resources'
      },
      { label: 'Journeys', url: '/journeys' },
      { label: 'Videos', url: '/watch' },
      { label: 'JesusFilm App', url: '/tools/app/' },
      { label: 'Youtube', url: '/tools/youtube/' },
      {
        label: 'DVDs & Media',
        url: 'https://crustore.org/product-category/jesus-film-project/'
      },
      { label: 'Become A Partner', url: '/partners/' }
    ]
  },
  { label: 'Careers', url: '/serve/' },
  { label: 'Visit us', url: '/about/tour/' },
  { label: 'Press', url: '/press/' },
  { label: 'Contact Us', url: '/contact/' }
]
