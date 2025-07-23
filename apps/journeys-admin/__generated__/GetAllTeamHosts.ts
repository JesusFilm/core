/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAllTeamHosts
// ====================================================

export interface GetAllTeamHosts_hosts {
  __typename: "Host";
  id: string | null;
  location: string | null;
  src1: string | null;
  src2: string | null;
  title: string | null;
}

export interface GetAllTeamHosts {
  hosts: GetAllTeamHosts_hosts[] | null;
}

export interface GetAllTeamHostsVariables {
  teamId: string;
}
