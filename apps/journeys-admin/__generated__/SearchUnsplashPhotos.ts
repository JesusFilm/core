/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchUnsplashPhotos
// ====================================================

export interface SearchUnsplashPhotos_searchUnsplashPhotos_results_urls {
  __typename: "UnsplashPhotoUrls";
  raw: string;
  regular: string;
}

export interface SearchUnsplashPhotos_searchUnsplashPhotos_results_links {
  __typename: "UnsplashPhotoLinks";
  download_location: string;
}

export interface SearchUnsplashPhotos_searchUnsplashPhotos_results_user {
  __typename: "UnsplashUser";
  first_name: string;
  last_name: string | null;
  username: string;
}

export interface SearchUnsplashPhotos_searchUnsplashPhotos_results {
  __typename: "UnsplashPhoto";
  id: string;
  alt_description: string | null;
  blur_hash: string | null;
  width: number;
  height: number;
  urls: SearchUnsplashPhotos_searchUnsplashPhotos_results_urls;
  links: SearchUnsplashPhotos_searchUnsplashPhotos_results_links;
  user: SearchUnsplashPhotos_searchUnsplashPhotos_results_user;
}

export interface SearchUnsplashPhotos_searchUnsplashPhotos {
  __typename: "UnsplashQueryResponse";
  results: SearchUnsplashPhotos_searchUnsplashPhotos_results[];
}

export interface SearchUnsplashPhotos {
  searchUnsplashPhotos: SearchUnsplashPhotos_searchUnsplashPhotos;
}

export interface SearchUnsplashPhotosVariables {
  query: string;
  page?: number | null;
  perPage?: number | null;
}
