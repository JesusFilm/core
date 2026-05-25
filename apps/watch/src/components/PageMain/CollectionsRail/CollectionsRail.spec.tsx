import { render, screen } from '@testing-library/react'

import { CollectionsRail } from './CollectionsRail'

const mockTranslations: Record<string, string> = {
  'Video Bible Collection': 'Collection de vidéos bibliques',
  'Discover the full story': "Découvre toute l'histoire",
  'Explore our collection of videos and resources that bring the Bible to life through engaging stories and teachings.':
    'Explore notre collection de vidéos et de ressources qui donnent vie à la Bible à travers des récits et des enseignements captivants.',
  'Scripture Told Through Film': "L'Écriture racontée par le film",
  'Christmas Advent': 'Avent de Noël',
  'Christmas Advent Countdown': "Compte à rebours de l'Avent de Noël",
  "Join our Advent journey with a daily video that builds anticipation for Christmas, exploring the hope, joy, and promise of Jesus' arrival.":
    "Rejoins notre parcours de l'Avent avec une vidéo quotidienne qui nourrit l'attente de Noël et explore l'espérance, la joie et la promesse de la venue de Jésus.",
  'Bible Project': 'Bible Project',
  'NUA Series': 'Série NUA',
  'Worth Series': 'Série Worth',
  'NUA Worth': 'NUA Worth',
  'Video Course': 'Cours vidéo',
  'Every Gospel, Told on Video': 'Chaque Évangile, raconté en vidéo',
  'Scripture, Spoken Exactly as Written':
    "L'Écriture, prononcée exactement comme elle est écrite"
}

jest.mock('next-i18next/pages', () => ({
  useTranslation: () => ({
    t: (key: string) => mockTranslations[key] ?? key
  })
}))

jest.mock('../../SectionVideoCarousel', () => ({
  SectionVideoCarousel: ({
    id,
    subtitleOverride,
    titleOverride,
    descriptionOverride,
    languageId
  }: {
    id: string
    subtitleOverride?: string
    titleOverride?: string
    descriptionOverride?: string
    languageId?: string
  }) => (
    <div data-testid={id} data-language-id={languageId}>
      {subtitleOverride}|{titleOverride}|{descriptionOverride}
    </div>
  )
}))

jest.mock('../../SectionVideoGrid', () => ({
  SectionVideoGrid: ({
    id,
    subtitleOverride,
    titleOverride,
    descriptionOverride,
    languageId
  }: {
    id: string
    subtitleOverride?: string
    titleOverride?: string
    descriptionOverride?: string
    languageId?: string
  }) => (
    <div data-testid={id} data-language-id={languageId}>
      {subtitleOverride}|{titleOverride}|{descriptionOverride}
    </div>
  )
}))

describe('CollectionsRail', () => {
  it('passes translated override copy and languageId to landing rails', () => {
    render(<CollectionsRail languageId="496" />)

    expect(screen.getByTestId('home-video-gospels')).toHaveTextContent(
      "Collection de vidéos bibliques|Découvre toute l'histoire|Explore notre collection de vidéos et de ressources"
    )
    expect(screen.getByTestId('home-video-gospels')).toHaveAttribute(
      'data-language-id',
      '496'
    )
    expect(
      screen.getByTestId('home-collection-showcase-grid-christmas-advent')
    ).toHaveTextContent(
      "Avent de Noël|Compte à rebours de l'Avent de Noël|Rejoins notre parcours de l'Avent"
    )
    expect(
      screen.getByTestId('home-collection-showcase-grid-vertical')
    ).toHaveTextContent(
      "Chaque Évangile, raconté en vidéo|L'Écriture, prononcée exactement comme elle est écrite|Explore notre collection"
    )
  })
})
