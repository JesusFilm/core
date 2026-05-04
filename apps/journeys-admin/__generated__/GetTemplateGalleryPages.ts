/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTemplateGalleryPages
// ====================================================

export interface GetTemplateGalleryPages_templateGalleryPages_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface GetTemplateGalleryPages_templateGalleryPages_templates {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  primaryImageBlock: GetTemplateGalleryPages_templateGalleryPages_templates_primaryImageBlock | null;
}

export interface GetTemplateGalleryPages_templateGalleryPages {
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
  templates: GetTemplateGalleryPages_templateGalleryPages_templates[];
}

export interface GetTemplateGalleryPages {
  templateGalleryPages: GetTemplateGalleryPages_templateGalleryPages[];
}

export interface GetTemplateGalleryPagesVariables {
  teamId: string;
}
