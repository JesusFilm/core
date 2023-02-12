/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ListUnsplashCollectionPhotos
// ====================================================

export interface ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_urls {
  __typename: "UnsplashPhotoUrls";
  small: string;
  regular: string;
}

export interface ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_user {
  __typename: "UnsplashUser";
  first_name: string;
  username: string;
}

export interface ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos {
  __typename: "UnsplashPhoto";
  id: string;
  width: number;
  height: number;
  urls: ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_urls;
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
