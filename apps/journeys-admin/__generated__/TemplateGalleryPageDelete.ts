/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TemplateGalleryPageDelete
// ====================================================

export interface TemplateGalleryPageDelete_templateGalleryPageDelete {
  __typename: "TemplateGalleryPage";
  /**
   * Stable UUID identifier.
   */
  id: string;
}

export interface TemplateGalleryPageDelete {
  /**
   * Hard-delete a TemplateGalleryPage. Cascades through `TemplateGalleryPageTemplate` join rows automatically; the underlying `Journey` rows are NOT deleted. Returns the deleted page (last canonical view).
   * 
   * Auth: caller must be a member of the page's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the page's team.
   */
  templateGalleryPageDelete: TemplateGalleryPageDelete_templateGalleryPageDelete;
}

export interface TemplateGalleryPageDeleteVariables {
  id: string;
}
