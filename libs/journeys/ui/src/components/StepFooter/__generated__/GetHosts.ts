/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetHosts
// ====================================================

export interface GetHosts_hosts {
  __typename: "Host";
  id: string;
  title: string;
  src1: string | null;
  src2: string | null;
  location: string | null;
}

export interface GetHosts {
  hosts: GetHosts_hosts[];
}
