/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageUnpublish
// ====================================================

export interface TemplateGalleryPageUnpublish_templateGalleryPageUnpublish {
  __typename: "TemplateGalleryPage";
  id: string;
  status: TemplateGalleryPageStatus;
  publishedAt: any | null;
  updatedAt: any;
}

export interface TemplateGalleryPageUnpublish {
  templateGalleryPageUnpublish: TemplateGalleryPageUnpublish_templateGalleryPageUnpublish;
}

export interface TemplateGalleryPageUnpublishVariables {
  id: string;
}
