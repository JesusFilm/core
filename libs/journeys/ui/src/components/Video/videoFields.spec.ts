import { gql } from '@apollo/client'

import { VIDEO_FIELDS } from './videoFields'

describe('VIDEO_FIELDS', () => {
  it('should be a valid GraphQL DocumentNode', () => {
    expect(VIDEO_FIELDS).toBeDefined()
    expect(VIDEO_FIELDS.kind).toBe('Document')
  })

  it('should include VideoFields fragment definition', () => {
    const definitions = VIDEO_FIELDS.definitions
    const videoFieldsFragment = definitions.find(
      (definition) =>
        definition.kind === 'FragmentDefinition' &&
        definition.name.value === 'VideoFields'
    )

    expect(videoFieldsFragment).toBeDefined()
    if (
      videoFieldsFragment &&
      videoFieldsFragment.kind === 'FragmentDefinition'
    ) {
      expect(videoFieldsFragment.typeCondition.name.value).toBe('VideoBlock')
    }
  })

  it('should include all required VideoBlock fields', () => {
    const queryString = VIDEO_FIELDS.loc?.source.body ?? ''

    const requiredFields = [
      'id',
      'parentBlockId',
      'parentOrder',
      'muted',
      'autoplay',
      'startAt',
      'endAt',
      'posterBlockId',
      'fullsize',
      'videoId',
      'videoVariantLanguageId',
      'source',
      'title',
      'description',
      'image',
      'duration',
      'objectFit',
      'subtitleLanguage',
      'showGeneratedSubtitles',
      'mediaVideo',
      'action'
    ]

    requiredFields.forEach((field) => {
      expect(queryString).toContain(field)
    })
  })

  it('should include subtitleLanguage fields', () => {
    const queryString = VIDEO_FIELDS.loc?.source.body ?? ''

    expect(queryString).toContain('subtitleLanguage')
    expect(queryString).toContain('bcp47')
  })

  it('should include showGeneratedSubtitles field', () => {
    const queryString = VIDEO_FIELDS.loc?.source.body ?? ''

    expect(queryString).toContain('showGeneratedSubtitles')
  })

  it('should include Video media type with all fields', () => {
    const queryString = VIDEO_FIELDS.loc?.source.body ?? ''

    expect(queryString).toContain('... on Video')
    expect(queryString).toContain('title(primary: true)')
    expect(queryString).toContain('images(aspectRatio: banner)')
    expect(queryString).toContain('mobileCinematicHigh')
    expect(queryString).toContain('variant')
    expect(queryString).toContain('hls')
    expect(queryString).toContain('variantLanguages')
  })

  it('should include MuxVideo media type with all fields', () => {
    const queryString = VIDEO_FIELDS.loc?.source.body ?? ''

    expect(queryString).toContain('... on MuxVideo')
    expect(queryString).toContain('assetId')
    expect(queryString).toContain('playbackId')
  })

  it('should include YouTube media type', () => {
    const queryString = VIDEO_FIELDS.loc?.source.body ?? ''

    expect(queryString).toContain('... on YouTube')
  })

  it('should include ActionFields fragment', () => {
    const queryString = VIDEO_FIELDS.loc?.source.body ?? ''

    expect(queryString).toContain('action')
    expect(queryString).toContain('...ActionFields')
  })

  it('should be usable in a GraphQL query', () => {
    const testQuery = gql`
      ${VIDEO_FIELDS}
      query GetVideoBlock($id: ID!) {
        block(id: $id) {
          ...VideoFields
        }
      }
    `

    expect(testQuery).toBeDefined()
    expect(testQuery.kind).toBe('Document')
  })

  it('should handle nested variantLanguages structure', () => {
    const queryString = VIDEO_FIELDS.loc?.source.body ?? ''

    expect(queryString).toContain('variantLanguages')
    expect(queryString).toContain('name')
    expect(queryString).toContain('value')
    expect(queryString).toContain('primary')
  })

  it('should include objectFit field', () => {
    const queryString = VIDEO_FIELDS.loc?.source.body ?? ''

    expect(queryString).toContain('objectFit')
  })
})
