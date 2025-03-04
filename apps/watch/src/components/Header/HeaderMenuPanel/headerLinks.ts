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
    label: 'About Us',
    subLinks: [
      { label: 'Our Organization', url: 'https://www.jesusfilm.org/about/' },
      { label: 'Our History', url: 'https://www.jesusfilm.org/about/history/' },
      {
        label: 'Leadership Team',
        url: 'https://www.jesusfilm.org/about/team/'
      },
      { label: 'Why Film?', url: 'https://www.jesusfilm.org/about/why-film/' },
      {
        label: 'Statement Of Faith',
        url: 'https://www.jesusfilm.org/about/faith-statement/'
      },
      { label: 'FAQs', url: 'https://www.jesusfilm.org/about/faq/' },
      {
        label: 'Statistics',
        url: 'https://www.jesusfilm.org/partners/resources/strategies/statistics/'
      }
    ]
  },
  { label: 'Blog', url: 'https://www.jesusfilm.org/blog/' },
  {
    label: 'Give',
    subLinks: [
      { label: 'Ways to Give', url: 'https://www.jesusfilm.org/give/' },
      { label: 'Why Give', url: 'https://www.jesusfilm.org/give/why-give/' },
      {
        label: 'Current Projects',
        url: 'https://www.jesusfilm.org/give/ways-to-give/current-projects/'
      },
      {
        label: 'Honors & Memorials',
        url: 'https://www.jesusfilm.org/give/ways-to-give/memorials-living-tributes/'
      },
      { label: 'Gift Catalog', url: 'https://giftcatalog.jesusfilm.org/' },
      {
        label: 'Tax Smart Giving',
        url: 'https://www.jesusfilm.org/give/ways-to-give/tax-smart-giving/'
      },
      {
        label: 'Financial Accountability',
        url: 'https://www.jesusfilm.org/give/accountability/'
      }
    ]
  },
  {
    label: 'Resources',
    subLinks: [
      {
        label: 'Strategies',
        url: 'https://www.jesusfilm.org/partners/resources/strategies/'
      },
      { label: 'Journeys', url: 'https://admin.nextstep.is/templates' },
      { label: 'Videos', url: 'https://www.jesusfilm.org/watch.html' },
      { label: 'JesusFilm App', url: 'https://www.jesusfilm.org/tools/app/' },
      { label: 'Youtube', url: 'https://www.jesusfilm.org/tools/youtube/' },
      {
        label: 'DVDs & Media',
        url: 'https://crustore.org/product-category/jesus-film-project/'
      },
      { label: 'Become A Partner', url: 'https://www.jesusfilm.org/partners/' }
    ]
  },
  { label: 'Careers', url: 'https://www.jesusfilm.org/serve/' },
  { label: 'Visit us', url: 'https://www.jesusfilm.org/about/tour/' },
  { label: 'Press', url: 'https://www.jesusfilm.org/press/' },
  { label: 'Contact Us', url: 'https://www.jesusfilm.org/contact/' }
]
