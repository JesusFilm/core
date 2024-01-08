import Typography from '@mui/material/Typography'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SwiperOptions } from 'swiper/types'

import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { TemplateGalleryCard } from '../../TemplateGalleryCard'

import { TemplateGalleryCarousel } from './TemplateGalleryCarousel'

describe('TemplateGalleryCarousel', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: '1',
    title: 'Featured Template 1',
    description: null,
    slug: 'default',
    template: true,
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    status: JourneyStatus.published,
    userJourneys: [],
    seoTitle: null,
    seoDescription: null,
    themeName: ThemeName.base,
    themeMode: ThemeMode.dark,
    tags: [],
    primaryImageBlock: {
      id: 'image1.id',
      __typename: 'ImageBlock',
      parentBlockId: null,
      parentOrder: 0,
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'random image from unsplash',
      width: 1920,
      height: 1080,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
    },
    trashedAt: null,
    publishedAt: '2023-08-14T04:24:24.392Z',
    createdAt: '2023-08-14T04:24:24.392Z',
    featuredAt: '2023-08-14T04:24:24.392Z'
  }

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    '@media (min-width:0px)': {
      slidesPerGroup: 1
    },
    '@media (min-width:600px)': {
      slidesPerGroup: 3
    },
    '@media (min-width:1200px)': {
      slidesPerGroup: 5
    }
  }

  it('should render TemplateGalleryCarousel with items', () => {
    const { getAllByRole, getByRole } = render(
      <TemplateGalleryCarousel
        heading="Easter"
        items={[journey, { ...journey, id: '2', title: 'Featured Template 2' }]}
        renderItem={(itemProps) => (
          <Typography variant="h6">
            {itemProps.item != null ? itemProps.item.title : 'placeholder'}
            {itemProps.priority === true ? 'priority' : undefined}
          </Typography>
        )}
        breakpoints={swiperBreakpoints}
        priority
      />
    )
    expect(getByRole('heading', { name: 'Easter' })).toBeInTheDocument()
    const items = getAllByRole('heading', { level: 6 })
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Featured Template 1priority')
    expect(items[1]).toHaveTextContent('Featured Template 2priority')
  })

  it('should focus elements in the carousel', async () => {
    const { getAllByLabelText } = render(
      <TemplateGalleryCarousel
        heading="Easter"
        items={[journey, { ...journey, id: '2', title: 'Featured Template 2' }]}
        renderItem={(itemProps) => <TemplateGalleryCard {...itemProps} />}
        breakpoints={swiperBreakpoints}
      />
    )

    await waitFor(async () => await userEvent.tab())
    expect(getAllByLabelText('templateGalleryCard')[0]).toHaveStyle(
      'outline: 2px solid'
    )
    await waitFor(async () => await userEvent.tab())
    expect(getAllByLabelText('templateGalleryCard')[1]).toHaveStyle(
      'outline: 2px solid'
    )
    expect(getAllByLabelText('templateGalleryCard')[0]).not.toHaveStyle(
      'outline: 2px solid'
    )
  })

  it('should render TemplateGalleryCarousel with placeholder items', () => {
    const { getAllByRole, getByRole, queryByRole } = render(
      <TemplateGalleryCarousel
        items={[journey]}
        renderItem={(itemProps) => (
          <Typography variant="h6">
            {itemProps.item != null ? itemProps.item.title : 'placeholder'}
          </Typography>
        )}
        breakpoints={swiperBreakpoints}
        loading
      />
    )
    expect(queryByRole('heading', { level: 5 })).not.toBeInTheDocument()
    const items = getAllByRole('heading', { level: 6 })
    expect(items).toHaveLength(8)
    expect(items[0]).toHaveTextContent('placeholder')
    expect(
      getByRole('button', { name: 'prev-button-disabled' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'next-button-disabled' })
    ).toBeInTheDocument()
  })
})
