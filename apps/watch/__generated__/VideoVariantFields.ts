/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: VideoVariantFields
// ====================================================

export interface VideoVariantFields_variantLanguagesWithSlug_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface VideoVariantFields_variantLanguagesWithSlug_language {
  __typename: "Language";
  id: string;
  name: VideoVariantFields_variantLanguagesWithSlug_language_name[];
}

export interface VideoVariantFields_variantLanguagesWithSlug {
  __typename: "LanguageWithSlug";
  slug: string | null;
  language: VideoVariantFields_variantLanguagesWithSlug_language | null;
}

export interface VideoVariantFields {
  __typename: "Video";
  id: string;
  variantLanguagesWithSlug: VideoVariantFields_variantLanguagesWithSlug[];
}
