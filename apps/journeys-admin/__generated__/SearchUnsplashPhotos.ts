/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchUnsplashPhotos
// ====================================================

export interface SearchUnsplashPhotos_searchUnsplashPhotos_results_urls {
  __typename: "UnsplashPhotoUrls";
  small: string | null;
}

export interface SearchUnsplashPhotos_searchUnsplashPhotos_results_user {
  __typename: "UnsplashUser";
  first_name: string | null;
  last_name: string | null;
  username: string | null;
}

export interface SearchUnsplashPhotos_searchUnsplashPhotos_results {
  __typename: "UnsplashPhoto";
  id: string | null;
  alt_description: string | null;
  width: number | null;
  height: number | null;
  urls: SearchUnsplashPhotos_searchUnsplashPhotos_results_urls | null;
  user: SearchUnsplashPhotos_searchUnsplashPhotos_results_user | null;
}

export interface SearchUnsplashPhotos_searchUnsplashPhotos {
  __typename: "UnsplashQueryResponse";
  results: (SearchUnsplashPhotos_searchUnsplashPhotos_results | null)[] | null;
}

export interface SearchUnsplashPhotos {
  searchUnsplashPhotos: SearchUnsplashPhotos_searchUnsplashPhotos;
}

export interface SearchUnsplashPhotosVariables {
  query: string;
  page?: number | null;
  perPage?: number | null;
}
