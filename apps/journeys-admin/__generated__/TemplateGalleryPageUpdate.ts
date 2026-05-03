/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TemplateGalleryPageUpdateInput, TemplateGalleryPageStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageUpdate
// ====================================================

export interface TemplateGalleryPageUpdate_templateGalleryPageUpdate_creatorImageBlock_ButtonBlock {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface TemplateGalleryPageUpdate_templateGalleryPageUpdate_creatorImageBlock_ImageBlock {
  __typename: "ImageBlock";
  id: string;
  src: string | null;
  alt: string;
}

export type TemplateGalleryPageUpdate_templateGalleryPageUpdate_creatorImageBlock = TemplateGalleryPageUpdate_templateGalleryPageUpdate_creatorImageBlock_ButtonBlock | TemplateGalleryPageUpdate_templateGalleryPageUpdate_creatorImageBlock_ImageBlock;

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
  creatorImageBlock: TemplateGalleryPageUpdate_templateGalleryPageUpdate_creatorImageBlock | null;
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
