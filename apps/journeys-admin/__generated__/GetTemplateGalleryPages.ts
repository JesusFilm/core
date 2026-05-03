/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTemplateGalleryPages
// ====================================================

export interface GetTemplateGalleryPages_templateGalleryPages_creatorImageBlock_ButtonBlock {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface GetTemplateGalleryPages_templateGalleryPages_creatorImageBlock_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export type GetTemplateGalleryPages_templateGalleryPages_creatorImageBlock = GetTemplateGalleryPages_templateGalleryPages_creatorImageBlock_ButtonBlock | GetTemplateGalleryPages_templateGalleryPages_creatorImageBlock_ImageBlock;

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
  creatorImageBlock: GetTemplateGalleryPages_templateGalleryPages_creatorImageBlock | null;
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
