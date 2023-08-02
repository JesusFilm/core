/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Hosts
// ====================================================

export interface Hosts_hosts {
  __typename: "Host";
  id: string;
  location: string | null;
  src1: string | null;
  src2: string | null;
  title: string;
}

export interface Hosts {
  hosts: Hosts_hosts[];
}

export interface HostsVariables {
  teamId: string;
}
