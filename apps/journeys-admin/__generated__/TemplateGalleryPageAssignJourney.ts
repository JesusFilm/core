/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageAssignJourney
// ====================================================

export interface TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney_templates_primaryImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export interface TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney_templates {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  primaryImageBlock: TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney_templates_primaryImageBlock | null;
}

export interface TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney {
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
  templates: TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney_templates[];
}

export interface TemplateGalleryPageAssignJourney {
  templateGalleryPageAssignJourney: TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney | null;
}

export interface TemplateGalleryPageAssignJourneyVariables {
  journeyId: string;
  pageId?: string | null;
}
