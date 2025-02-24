import * as Types from '../../../../__generated__/globalTypes';

export type GetUserRoleQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetUserRoleQuery = { getUserRole: { __typename: 'UserRole', id: string, roles: Array<Types.Role> | null } | null };
