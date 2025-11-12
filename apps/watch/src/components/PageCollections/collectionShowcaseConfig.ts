import { type SectionVideoCollectionCarouselSource } from '../SectionVideoCarousel'

export const collectionShowcaseSources: SectionVideoCollectionCarouselSource[] =
  [
    { type: 'video', id: '1_jf-0-0' },
    { type: 'video', id: '2_GOJ-0-0' },
    { type: 'collection', id: 'LUMOCollection', limitChildren: 4 }
  ]

export const christmasAdventShowcaseSources: SectionVideoCollectionCarouselSource[] =
  [
    { type: 'video', id: '2_0-ConsideringChristmas' },
    { type: 'collection', id: 'ChristmasAdventCollection', limitChildren: 25 }
  ]
