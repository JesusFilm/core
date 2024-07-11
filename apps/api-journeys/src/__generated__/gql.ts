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
 */
const documents = {
    "\n  query GetTags {\n    tags {\n      id\n      name {\n        value\n        primary\n      }\n    }\n  }\n": types.GetTagsDocument,
    "\n  query GetLanguage($languageId: ID) {\n    languages(limit: 5000) {\n      id\n      name(languageId: $languageId, primary: true) {\n        value\n        primary\n      }\n    }\n  }\n": types.GetLanguageDocument,
    "\n  query GetUser($userId: ID!) {\n    user(id: $userId) {\n      id\n      email\n      firstName\n      imageUrl\n    }\n  }\n": types.GetUserDocument,
    "\n  query GetUserByEmail($email: String!) {\n    userByEmail(email: $email) {\n      id\n      email\n      firstName\n      imageUrl\n    }\n  }\n": types.GetUserByEmailDocument,
    "\n            query User($userId: ID!) {\n              user(id: $userId) {\n                id\n                firstName\n                email\n                imageUrl\n              }\n            }\n          ": types.UserDocument,
    "         \n    query GetLanguages($languageId: ID!) {\n    language(id: $languageId) {\n      bcp47\n      id\n    }\n  }\n": types.GetLanguagesDocument,
    "\n  mutation SiteCreate($input: SiteCreateInput!) {\n    siteCreate(input: $input) {\n      ... on Error {\n        message\n        __typename\n      }\n      ... on MutationSiteCreateSuccess {\n        data {\n          id\n          domain\n          __typename\n          memberships {\n            id\n            role\n            __typename\n          }\n          goals {\n            id\n            eventName\n            __typename\n          }\n          sharedLinks {\n            id\n            slug\n            __typename\n          }\n        }\n      }\n    }\n  }\n": types.SiteCreateDocument,
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
export function gql(source: "\n  query GetTags {\n    tags {\n      id\n      name {\n        value\n        primary\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetTags {\n    tags {\n      id\n      name {\n        value\n        primary\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetLanguage($languageId: ID) {\n    languages(limit: 5000) {\n      id\n      name(languageId: $languageId, primary: true) {\n        value\n        primary\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetLanguage($languageId: ID) {\n    languages(limit: 5000) {\n      id\n      name(languageId: $languageId, primary: true) {\n        value\n        primary\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUser($userId: ID!) {\n    user(id: $userId) {\n      id\n      email\n      firstName\n      imageUrl\n    }\n  }\n"): (typeof documents)["\n  query GetUser($userId: ID!) {\n    user(id: $userId) {\n      id\n      email\n      firstName\n      imageUrl\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserByEmail($email: String!) {\n    userByEmail(email: $email) {\n      id\n      email\n      firstName\n      imageUrl\n    }\n  }\n"): (typeof documents)["\n  query GetUserByEmail($email: String!) {\n    userByEmail(email: $email) {\n      id\n      email\n      firstName\n      imageUrl\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n            query User($userId: ID!) {\n              user(id: $userId) {\n                id\n                firstName\n                email\n                imageUrl\n              }\n            }\n          "): (typeof documents)["\n            query User($userId: ID!) {\n              user(id: $userId) {\n                id\n                firstName\n                email\n                imageUrl\n              }\n            }\n          "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "         \n    query GetLanguages($languageId: ID!) {\n    language(id: $languageId) {\n      bcp47\n      id\n    }\n  }\n"): (typeof documents)["         \n    query GetLanguages($languageId: ID!) {\n    language(id: $languageId) {\n      bcp47\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SiteCreate($input: SiteCreateInput!) {\n    siteCreate(input: $input) {\n      ... on Error {\n        message\n        __typename\n      }\n      ... on MutationSiteCreateSuccess {\n        data {\n          id\n          domain\n          __typename\n          memberships {\n            id\n            role\n            __typename\n          }\n          goals {\n            id\n            eventName\n            __typename\n          }\n          sharedLinks {\n            id\n            slug\n            __typename\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SiteCreate($input: SiteCreateInput!) {\n    siteCreate(input: $input) {\n      ... on Error {\n        message\n        __typename\n      }\n      ... on MutationSiteCreateSuccess {\n        data {\n          id\n          domain\n          __typename\n          memberships {\n            id\n            role\n            __typename\n          }\n          goals {\n            id\n            eventName\n            __typename\n          }\n          sharedLinks {\n            id\n            slug\n            __typename\n          }\n        }\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;