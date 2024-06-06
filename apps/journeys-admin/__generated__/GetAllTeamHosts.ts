/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAllTeamHosts
// ====================================================

export interface GetAllTeamHosts_hosts {
  __typename: "Host";
  id: string;
  location: string | null;
  src1: string | null;
  src2: string | null;
  title: string;
}

export interface GetAllTeamHosts {
  hosts: GetAllTeamHosts_hosts[];
}

export interface GetAllTeamHostsVariables {
  teamId: string;
}
