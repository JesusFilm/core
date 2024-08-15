/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
    'AudioPreview': { kind: 'OBJECT'; name: 'AudioPreview'; fields: { 'duration': { name: 'duration'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'size': { name: 'size'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'Boolean': unknown;
    'Continent': { kind: 'OBJECT'; name: 'Continent'; fields: { 'countries': { name: 'countries'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Country'; ofType: null; }; }; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'ContinentName'; ofType: null; }; }; }; } }; }; };
    'ContinentName': { kind: 'OBJECT'; name: 'ContinentName'; fields: { 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'Country': { kind: 'OBJECT'; name: 'Country'; fields: { 'continent': { name: 'continent'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Continent'; ofType: null; }; } }; 'countryLanguages': { name: 'countryLanguages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CountryLanguage'; ofType: null; }; }; }; } }; 'flagPngSrc': { name: 'flagPngSrc'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'flagWebpSrc': { name: 'flagWebpSrc'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'languages': { name: 'languages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; }; }; } }; 'latitude': { name: 'latitude'; type: { kind: 'SCALAR'; name: 'Float'; ofType: null; } }; 'longitude': { name: 'longitude'; type: { kind: 'SCALAR'; name: 'Float'; ofType: null; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CountryName'; ofType: null; }; }; }; } }; 'population': { name: 'population'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; }; };
    'CountryLanguage': { kind: 'OBJECT'; name: 'CountryLanguage'; fields: { 'country': { name: 'country'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Country'; ofType: null; }; } }; 'displaySpeakers': { name: 'displaySpeakers'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'speakers': { name: 'speakers'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; }; };
    'CountryName': { kind: 'OBJECT'; name: 'CountryName'; fields: { 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'Float': unknown;
    'ID': unknown;
    'Int': unknown;
    'Language': { kind: 'OBJECT'; name: 'Language'; fields: { 'audioPreview': { name: 'audioPreview'; type: { kind: 'OBJECT'; name: 'AudioPreview'; ofType: null; } }; 'bcp47': { name: 'bcp47'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'countryLanguages': { name: 'countryLanguages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CountryLanguage'; ofType: null; }; }; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'iso3': { name: 'iso3'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'LanguageName'; ofType: null; }; }; }; } }; }; };
    'LanguageIdType': { name: 'LanguageIdType'; enumValues: 'databaseId' | 'bcp47'; };
    'LanguageName': { kind: 'OBJECT'; name: 'LanguageName'; fields: { 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'LanguagesFilter': { kind: 'INPUT_OBJECT'; name: 'LanguagesFilter'; isOneOf: false; inputFields: [{ name: 'ids'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; }; }; defaultValue: null }]; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'countries': { name: 'countries'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Country'; ofType: null; }; }; }; } }; 'country': { name: 'country'; type: { kind: 'OBJECT'; name: 'Country'; ofType: null; } }; 'language': { name: 'language'; type: { kind: 'OBJECT'; name: 'Language'; ofType: null; } }; 'languages': { name: 'languages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; }; }; } }; }; };
    'String': unknown;
};

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  name: never;
  query: 'Query';
  mutation: never;
  subscription: never;
  types: introspection_types;
};

import * as gqlTada from 'gql.tada';

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection
  }
}