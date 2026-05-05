/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageReorderTemplate
// ====================================================

export interface TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate_templates {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  primaryImageBlock: TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate_templates_primaryImageBlock | null;
}

export interface TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate {
  __typename: "TemplateGalleryPage";
  id: string;
  title: string;
  description: string;
  slug: string;
  status: TemplateGalleryPageStatus;
  creatorName: string;
  creatorImageSrc: string | null;
  creatorImageAlt: string | null;
  mediaUrl: string | null;
  publishedAt: any | null;
  createdAt: any;
  updatedAt: any;
  templates: TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate_templates[];
}

export interface TemplateGalleryPageReorderTemplate {
  templateGalleryPageReorderTemplate: TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate;
}

export interface TemplateGalleryPageReorderTemplateVariables {
  pageId: string;
  journeyId: string;
  order: number;
}
