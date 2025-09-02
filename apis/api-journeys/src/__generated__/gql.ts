/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetMuxVideo($id: ID!) {\n    getMuxVideo(id: $id) {\n      id\n      name\n      playbackId\n      duration\n    }\n  }\n": typeof types.GetMuxVideoDocument,
    "\n  query GetLanguages($languageId: ID!) {\n    language(id: $languageId) {\n      bcp47\n      id\n    }\n  }\n": typeof types.GetLanguagesDocument,
    "\n  mutation SiteCreate($input: SiteCreateInput!) {\n    siteCreate(input: $input) {\n      ... on Error {\n        message\n        __typename\n      }\n      ... on MutationSiteCreateSuccess {\n        data {\n          id\n          domain\n          __typename\n          memberships {\n            id\n            role\n            __typename\n          }\n          goals {\n            id\n            eventName\n            __typename\n          }\n          sharedLinks {\n            id\n            slug\n            __typename\n          }\n        }\n      }\n    }\n  }\n": typeof types.SiteCreateDocument,
    "\n  query GetShortLink($id: String!) {\n    shortLink(id: $id) {\n      ... on NotFoundError {\n        message\n      }\n      ... on QueryShortLinkSuccess {\n        data {\n          id\n          pathname\n          to\n          domain {\n            hostname\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetShortLinkDocument,
    "\n  mutation shortLinkCreate($input: MutationShortLinkCreateInput!) {\n    shortLinkCreate(input: $input) {\n      ... on ZodError {\n        message\n      }\n      ... on NotUniqueError {\n        message\n      }\n      ... on MutationShortLinkCreateSuccess {\n        data {\n          id\n          pathname\n          to\n          domain {\n            hostname\n          }\n        }\n      }\n    }\n  }\n": typeof types.ShortLinkCreateDocument,
    "\n  mutation shortLinkUpdate($input: MutationShortLinkUpdateInput!) {\n    shortLinkUpdate(input: $input) {\n      ... on ZodError {\n        message\n      }\n      ... on NotFoundError {\n        message\n      }\n      ... on MutationShortLinkUpdateSuccess {\n        data {\n          id\n          to\n        }\n      }\n    }\n  }\n": typeof types.ShortLinkUpdateDocument,
    "\n  mutation shortLinkDelete($id: String!) {\n    shortLinkDelete(id: $id) {\n      ... on NotFoundError {\n        message\n      }\n      ... on MutationShortLinkDeleteSuccess {\n        data {\n          id\n        }\n      }\n    }\n  }\n": typeof types.ShortLinkDeleteDocument,
};
const documents: Documents = {
    "\n  query GetMuxVideo($id: ID!) {\n    getMuxVideo(id: $id) {\n      id\n      name\n      playbackId\n      duration\n    }\n  }\n": types.GetMuxVideoDocument,
    "\n  query GetLanguages($languageId: ID!) {\n    language(id: $languageId) {\n      bcp47\n      id\n    }\n  }\n": types.GetLanguagesDocument,
    "\n  mutation SiteCreate($input: SiteCreateInput!) {\n    siteCreate(input: $input) {\n      ... on Error {\n        message\n        __typename\n      }\n      ... on MutationSiteCreateSuccess {\n        data {\n          id\n          domain\n          __typename\n          memberships {\n            id\n            role\n            __typename\n          }\n          goals {\n            id\n            eventName\n            __typename\n          }\n          sharedLinks {\n            id\n            slug\n            __typename\n          }\n        }\n      }\n    }\n  }\n": types.SiteCreateDocument,
    "\n  query GetShortLink($id: String!) {\n    shortLink(id: $id) {\n      ... on NotFoundError {\n        message\n      }\n      ... on QueryShortLinkSuccess {\n        data {\n          id\n          pathname\n          to\n          domain {\n            hostname\n          }\n        }\n      }\n    }\n  }\n": types.GetShortLinkDocument,
    "\n  mutation shortLinkCreate($input: MutationShortLinkCreateInput!) {\n    shortLinkCreate(input: $input) {\n      ... on ZodError {\n        message\n      }\n      ... on NotUniqueError {\n        message\n      }\n      ... on MutationShortLinkCreateSuccess {\n        data {\n          id\n          pathname\n          to\n          domain {\n            hostname\n          }\n        }\n      }\n    }\n  }\n": types.ShortLinkCreateDocument,
    "\n  mutation shortLinkUpdate($input: MutationShortLinkUpdateInput!) {\n    shortLinkUpdate(input: $input) {\n      ... on ZodError {\n        message\n      }\n      ... on NotFoundError {\n        message\n      }\n      ... on MutationShortLinkUpdateSuccess {\n        data {\n          id\n          to\n        }\n      }\n    }\n  }\n": types.ShortLinkUpdateDocument,
    "\n  mutation shortLinkDelete($id: String!) {\n    shortLinkDelete(id: $id) {\n      ... on NotFoundError {\n        message\n      }\n      ... on MutationShortLinkDeleteSuccess {\n        data {\n          id\n        }\n      }\n    }\n  }\n": types.ShortLinkDeleteDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMuxVideo($id: ID!) {\n    getMuxVideo(id: $id) {\n      id\n      name\n      playbackId\n      duration\n    }\n  }\n"): (typeof documents)["\n  query GetMuxVideo($id: ID!) {\n    getMuxVideo(id: $id) {\n      id\n      name\n      playbackId\n      duration\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetLanguages($languageId: ID!) {\n    language(id: $languageId) {\n      bcp47\n      id\n    }\n  }\n"): (typeof documents)["\n  query GetLanguages($languageId: ID!) {\n    language(id: $languageId) {\n      bcp47\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SiteCreate($input: SiteCreateInput!) {\n    siteCreate(input: $input) {\n      ... on Error {\n        message\n        __typename\n      }\n      ... on MutationSiteCreateSuccess {\n        data {\n          id\n          domain\n          __typename\n          memberships {\n            id\n            role\n            __typename\n          }\n          goals {\n            id\n            eventName\n            __typename\n          }\n          sharedLinks {\n            id\n            slug\n            __typename\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SiteCreate($input: SiteCreateInput!) {\n    siteCreate(input: $input) {\n      ... on Error {\n        message\n        __typename\n      }\n      ... on MutationSiteCreateSuccess {\n        data {\n          id\n          domain\n          __typename\n          memberships {\n            id\n            role\n            __typename\n          }\n          goals {\n            id\n            eventName\n            __typename\n          }\n          sharedLinks {\n            id\n            slug\n            __typename\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetShortLink($id: String!) {\n    shortLink(id: $id) {\n      ... on NotFoundError {\n        message\n      }\n      ... on QueryShortLinkSuccess {\n        data {\n          id\n          pathname\n          to\n          domain {\n            hostname\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetShortLink($id: String!) {\n    shortLink(id: $id) {\n      ... on NotFoundError {\n        message\n      }\n      ... on QueryShortLinkSuccess {\n        data {\n          id\n          pathname\n          to\n          domain {\n            hostname\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation shortLinkCreate($input: MutationShortLinkCreateInput!) {\n    shortLinkCreate(input: $input) {\n      ... on ZodError {\n        message\n      }\n      ... on NotUniqueError {\n        message\n      }\n      ... on MutationShortLinkCreateSuccess {\n        data {\n          id\n          pathname\n          to\n          domain {\n            hostname\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation shortLinkCreate($input: MutationShortLinkCreateInput!) {\n    shortLinkCreate(input: $input) {\n      ... on ZodError {\n        message\n      }\n      ... on NotUniqueError {\n        message\n      }\n      ... on MutationShortLinkCreateSuccess {\n        data {\n          id\n          pathname\n          to\n          domain {\n            hostname\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation shortLinkUpdate($input: MutationShortLinkUpdateInput!) {\n    shortLinkUpdate(input: $input) {\n      ... on ZodError {\n        message\n      }\n      ... on NotFoundError {\n        message\n      }\n      ... on MutationShortLinkUpdateSuccess {\n        data {\n          id\n          to\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation shortLinkUpdate($input: MutationShortLinkUpdateInput!) {\n    shortLinkUpdate(input: $input) {\n      ... on ZodError {\n        message\n      }\n      ... on NotFoundError {\n        message\n      }\n      ... on MutationShortLinkUpdateSuccess {\n        data {\n          id\n          to\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation shortLinkDelete($id: String!) {\n    shortLinkDelete(id: $id) {\n      ... on NotFoundError {\n        message\n      }\n      ... on MutationShortLinkDeleteSuccess {\n        data {\n          id\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation shortLinkDelete($id: String!) {\n    shortLinkDelete(id: $id) {\n      ... on NotFoundError {\n        message\n      }\n      ... on MutationShortLinkDeleteSuccess {\n        data {\n          id\n        }\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;