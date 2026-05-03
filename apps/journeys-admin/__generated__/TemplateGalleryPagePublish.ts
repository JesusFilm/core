/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPagePublish
// ====================================================

export interface TemplateGalleryPagePublish_templateGalleryPagePublish {
  __typename: "TemplateGalleryPage";
  id: string;
  status: TemplateGalleryPageStatus;
  publishedAt: any | null;
  updatedAt: any;
  slug: string;
}

export interface TemplateGalleryPagePublish {
  templateGalleryPagePublish: TemplateGalleryPagePublish_templateGalleryPagePublish;
}

export interface TemplateGalleryPagePublishVariables {
  id: string;
}
