/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageCreateInput, TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageCreate
// ====================================================

export interface TemplateGalleryPageCreate_templateGalleryPageCreate_team {
  __typename: "Team";
  id: string;
}

export interface TemplateGalleryPageCreate_templateGalleryPageCreate_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface TemplateGalleryPageCreate_templateGalleryPageCreate_templates {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  primaryImageBlock: TemplateGalleryPageCreate_templateGalleryPageCreate_templates_primaryImageBlock | null;
}

export interface TemplateGalleryPageCreate_templateGalleryPageCreate {
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
  team: TemplateGalleryPageCreate_templateGalleryPageCreate_team;
  templates: TemplateGalleryPageCreate_templateGalleryPageCreate_templates[];
}

export interface TemplateGalleryPageCreate {
  templateGalleryPageCreate: TemplateGalleryPageCreate_templateGalleryPageCreate;
}

export interface TemplateGalleryPageCreateVariables {
  input: TemplateGalleryPageCreateInput;
}
