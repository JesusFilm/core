import type { Schema, Struct } from '@strapi/strapi'

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media'
  info: {
    displayName: 'Media'
    icon: 'file-video'
  }
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>
  }
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes'
  info: {
    displayName: 'Quote'
    icon: 'indent'
  }
  attributes: {
    body: Schema.Attribute.Text
    title: Schema.Attribute.String
  }
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts'
  info: {
    description: ''
    displayName: 'Rich text'
    icon: 'align-justify'
  }
  attributes: {
    body: Schema.Attribute.RichText
  }
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos'
  info: {
    description: ''
    displayName: 'Seo'
    icon: 'allergies'
    name: 'Seo'
  }
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required
    shareImage: Schema.Attribute.Media<'images'>
  }
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders'
  info: {
    description: ''
    displayName: 'Slider'
    icon: 'address-book'
  }
  attributes: {
    files: Schema.Attribute.Media<'images', true>
  }
}

export interface SharedStudyQuestion extends Struct.ComponentSchema {
  collectionName: 'components_shared_study_questions'
  info: {
    displayName: 'Study Question'
  }
  attributes: {
    value: Schema.Attribute.Text & Schema.Attribute.Required
  }
}

export interface VideoEditionSubtitle extends Struct.ComponentSchema {
  collectionName: 'components_video_edition_subtitles'
  info: {
    displayName: 'Subtitle'
  }
  attributes: {
    language: Schema.Attribute.Relation<'oneToOne', 'api::language.language'>
    srtSrc: Schema.Attribute.String
    vttSrc: Schema.Attribute.String
  }
}

export interface VideoVariantDownload extends Struct.ComponentSchema {
  collectionName: 'components_video_variant_downloads'
  info: {
    displayName: 'Download'
  }
  attributes: {
    bitrate: Schema.Attribute.Integer & Schema.Attribute.Required
    height: Schema.Attribute.Integer & Schema.Attribute.Required
    quality: Schema.Attribute.Enumeration<
      [
        'low',
        'high',
        'sd',
        'highest',
        'distroLow',
        'distroSd',
        'distroHigh',
        'fhd',
        'qhd',
        'uhd'
      ]
    > &
      Schema.Attribute.Required
    size: Schema.Attribute.BigInteger & Schema.Attribute.Required
    url: Schema.Attribute.String & Schema.Attribute.Required
    width: Schema.Attribute.Integer & Schema.Attribute.Required
  }
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.media': SharedMedia
      'shared.quote': SharedQuote
      'shared.rich-text': SharedRichText
      'shared.seo': SharedSeo
      'shared.slider': SharedSlider
      'shared.study-question': SharedStudyQuestion
      'video-edition.subtitle': VideoEditionSubtitle
      'video-variant.download': VideoVariantDownload
    }
  }
}
