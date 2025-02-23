import * as Types from '../../../../__generated__/types';

export type GetUserRoleQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetUserRoleQuery = { __typename?: 'Query', getUserRole?: { __typename?: 'UserRole', id: string, roles?: Array<Types.Role> | null } | null };
