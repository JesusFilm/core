/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideoVariant
// ====================================================

export interface GetVideoVariant_variant_variantLanguagesWithSlug_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideoVariant_variant_variantLanguagesWithSlug_language {
  __typename: "Language";
  id: string;
  name: GetVideoVariant_variant_variantLanguagesWithSlug_language_name[];
}

export interface GetVideoVariant_variant_variantLanguagesWithSlug {
  __typename: "LanguageWithSlug";
  slug: string | null;
  language: GetVideoVariant_variant_variantLanguagesWithSlug_language | null;
}

export interface GetVideoVariant_variant {
  __typename: "Video";
  id: string;
  variantLanguagesWithSlug: GetVideoVariant_variant_variantLanguagesWithSlug[];
}

export interface GetVideoVariant {
  variant: GetVideoVariant_variant | null;
}

export interface GetVideoVariantVariables {
  id: string;
}
