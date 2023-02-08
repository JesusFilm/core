/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ListUnsplashCollectionPhotos
// ====================================================

export interface ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_urls {
  __typename: "UnsplashPhotoUrls";
  small: string | null;
}

export interface ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_user {
  __typename: "UnsplashUser";
  first_name: string | null;
  last_name: string | null;
  username: string | null;
}

export interface ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos {
  __typename: "UnsplashPhoto";
  id: string | null;
  alt_description: string | null;
  width: number | null;
  height: number | null;
  urls: ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_urls | null;
  user: ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos_user | null;
}

export interface ListUnsplashCollectionPhotos {
  listUnsplashCollectionPhotos: (ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos | null)[];
}

export interface ListUnsplashCollectionPhotosVariables {
  collectionId: string;
  page?: number | null;
  perPage?: number | null;
}
