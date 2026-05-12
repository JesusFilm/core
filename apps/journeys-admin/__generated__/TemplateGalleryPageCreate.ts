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
  /**
   * Stable UUID identifier.
   */
  id: string;
  /**
   * Display title shown in admin UI and on the public page.
   */
  title: string;
  /**
   * Long-form description shown on the public page. Defaults to empty string.
   */
  description: string;
  /**
   * URL-safe identifier. The public page is reached at `/collections/<slug>`. Must match `^[a-z0-9]+(-[a-z0-9]+)*$`, max 200 characters, and must not be in the reserved list. Mutable after publish — changing it breaks any external links to the old URL.
   */
  slug: string;
  /**
   * `draft` hides the page from the public renderer; `published` exposes it via `templateGalleryPageBySlug`.
   */
  status: TemplateGalleryPageStatus;
  /**
   * Display name of the team or person credited as the page creator.
   */
  creatorName: string;
  /**
   * Optional https URL of the creator avatar image. Plain string (not a Block FK) — survives independently of any owning Block. https-only on write.
   */
  creatorImageSrc: string | null;
  /**
   * Optional alt text for the creator avatar.
   */
  creatorImageAlt: string | null;
  /**
   * Optional https URL of a hero/cover media asset shown on the public page. https-only on write.
   */
  mediaUrl: string | null;
  /**
   * Timestamp of the first publish event. Monotonic — never re-set on subsequent unpublish/republish, and never cleared. Null while the page has not yet been published.
   */
  publishedAt: any | null;
  createdAt: any;
  updatedAt: any;
  /**
   * Owning team. The page is hard-deleted when the team is deleted.
   */
  team: TemplateGalleryPageCreate_templateGalleryPageCreate_team;
  /**
   * Templates currently assigned to this page, in display order. Read-time filtered to same-team, non-soft-deleted, published, template-flagged journeys only — a journey transferred to another team or unflagged from `template` after being added is silently dropped from this list.
   */
  templates: TemplateGalleryPageCreate_templateGalleryPageCreate_templates[];
}

export interface TemplateGalleryPageCreate {
  /**
   * Create a new TemplateGalleryPage in `draft` status. The server generates a unique slug from `input.title`. Initial `journeyIds` are attached as templates in the order given (cross-team and non-template ids are silently filtered out).
   * 
   * Auth: caller must be authenticated and a member of `input.teamId`.
   * 
   * Errors:
   * - BAD_USER_INPUT (field: `mediaUrl` / `creatorImageSrc`): URL is not https.
   * - BAD_USER_INPUT (field: `slug`): the title normalizes to empty or to a reserved word.
   */
  templateGalleryPageCreate: TemplateGalleryPageCreate_templateGalleryPageCreate;
}

export interface TemplateGalleryPageCreateVariables {
  input: TemplateGalleryPageCreateInput;
}
