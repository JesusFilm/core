/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ListUnsplashCollectionPhotos
// ====================================================

export interface ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_urls {
  __typename: "UnsplashPhotoUrls";
  raw: string;
  regular: string;
}

export interface ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_links {
  __typename: "UnsplashPhotoLinks";
  download_location: string;
}

export interface ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_user {
  __typename: "UnsplashUser";
  first_name: string;
  last_name: string | null;
  username: string;
}

export interface ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos {
  __typename: "UnsplashPhoto";
  id: string;
  alt_description: string | null;
  blur_hash: string | null;
  width: number;
  height: number;
  urls: ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_urls;
  links: ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_links;
  user: ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_user;
}

export interface ListUnsplashCollectionPhotos {
  listUnsplashCollectionPhotos: ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos[];
}

export interface ListUnsplashCollectionPhotosVariables {
  collectionId: string;
  page?: number | null;
  perPage?: number | null;
}
