/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageUpdateInput, TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageUpdate
// ====================================================

export interface TemplateGalleryPageUpdate_templateGalleryPageUpdate_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface TemplateGalleryPageUpdate_templateGalleryPageUpdate_templates {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  primaryImageBlock: TemplateGalleryPageUpdate_templateGalleryPageUpdate_templates_primaryImageBlock | null;
}

export interface TemplateGalleryPageUpdate_templateGalleryPageUpdate {
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
  templates: TemplateGalleryPageUpdate_templateGalleryPageUpdate_templates[];
}

export interface TemplateGalleryPageUpdate {
  templateGalleryPageUpdate: TemplateGalleryPageUpdate_templateGalleryPageUpdate;
}

export interface TemplateGalleryPageUpdateVariables {
  id: string;
  input: TemplateGalleryPageUpdateInput;
}
