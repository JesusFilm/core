/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTemplateGalleryPage
// ====================================================

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_creatorImageBlock_ButtonBlock {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
}

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_creatorImageBlock_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}

export type GetTemplateGalleryPage_templateGalleryPageBySlug_creatorImageBlock = GetTemplateGalleryPage_templateGalleryPageBySlug_creatorImageBlock_ButtonBlock | GetTemplateGalleryPage_templateGalleryPageBySlug_creatorImageBlock_ImageBlock;

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_templates_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_templates_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: GetTemplateGalleryPage_templateGalleryPageBySlug_templates_language_name[];
}

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /**
   * blurhash is a compact representation of a placeholder for an image.
   * Find a frontend implementation at https: // github.com/woltapp/blurhash
   */
  blurhash: string;
}

export interface GetTemplateGalleryPage_templateGalleryPageBySlug_templates {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  slug: string;
  createdAt: any;
  template: boolean | null;
  /**
   * used to display quick start label on customizable templates
   */
  customizable: boolean | null;
  website: boolean | null;
  language: GetTemplateGalleryPage_templateGalleryPageBySlug_templates_language;
  primaryImageBlock: GetTemplateGalleryPage_templateGalleryPageBySlug_templates_primaryImageBlock | null;
}

export interface GetTemplateGalleryPage_templateGalleryPageBySlug {
  __typename: "TemplateGalleryPage";
  id: string;
  slug: string;
  title: string;
  description: string;
  creatorName: string;
  mediaUrl: string | null;
  publishedAt: any | null;
  creatorImageBlock: GetTemplateGalleryPage_templateGalleryPageBySlug_creatorImageBlock | null;
  templates: GetTemplateGalleryPage_templateGalleryPageBySlug_templates[];
}

export interface GetTemplateGalleryPage {
  templateGalleryPageBySlug: GetTemplateGalleryPage_templateGalleryPageBySlug | null;
}

export interface GetTemplateGalleryPageVariables {
  slug: string;
}
