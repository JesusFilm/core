/* eslint-disable */
/* prettier-ignore */

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  query: 'Query';
  mutation: never;
  subscription: never;
  types: {
    'AudioPreview': { kind: 'OBJECT'; name: 'AudioPreview'; fields: { 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'duration': { name: 'duration'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'size': { name: 'size'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; }; };
    'String': unknown;
    'Int': unknown;
    'Continent': { kind: 'OBJECT'; name: 'Continent'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'ContinentName'; ofType: null; }; }; }; } }; 'countries': { name: 'countries'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Country'; ofType: null; }; }; }; } }; }; };
    'ID': unknown;
    'Boolean': unknown;
    'ContinentName': { kind: 'OBJECT'; name: 'ContinentName'; fields: { 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; }; };
    'Country': { kind: 'OBJECT'; name: 'Country'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'population': { name: 'population'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'latitude': { name: 'latitude'; type: { kind: 'SCALAR'; name: 'Float'; ofType: null; } }; 'longitude': { name: 'longitude'; type: { kind: 'SCALAR'; name: 'Float'; ofType: null; } }; 'flagPngSrc': { name: 'flagPngSrc'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'flagWebpSrc': { name: 'flagWebpSrc'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'languages': { name: 'languages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; }; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CountryName'; ofType: null; }; }; }; } }; 'continent': { name: 'continent'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Continent'; ofType: null; }; } }; 'countryLanguages': { name: 'countryLanguages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CountryLanguage'; ofType: null; }; }; }; } }; }; };
    'Float': unknown;
    'CountryLanguage': { kind: 'OBJECT'; name: 'CountryLanguage'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'country': { name: 'country'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Country'; ofType: null; }; } }; 'speakers': { name: 'speakers'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'displaySpeakers': { name: 'displaySpeakers'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; }; };
    'CountryName': { kind: 'OBJECT'; name: 'CountryName'; fields: { 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; }; };
    'Language': { kind: 'OBJECT'; name: 'Language'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'bcp47': { name: 'bcp47'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'iso3': { name: 'iso3'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'LanguageName'; ofType: null; }; }; }; } }; 'countryLanguages': { name: 'countryLanguages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CountryLanguage'; ofType: null; }; }; }; } }; 'audioPreview': { name: 'audioPreview'; type: { kind: 'OBJECT'; name: 'AudioPreview'; ofType: null; } }; }; };
    'LanguageIdType': { kind: 'ENUM'; name: 'LanguageIdType'; type: 'databaseId' | 'bcp47'; };
    'LanguageName': { kind: 'OBJECT'; name: 'LanguageName'; fields: { 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; }; };
    'LanguagesFilter': { kind: 'INPUT_OBJECT'; name: 'LanguagesFilter'; inputFields: [{ name: 'ids'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; }; }; defaultValue: null }]; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'language': { name: 'language'; type: { kind: 'OBJECT'; name: 'Language'; ofType: null; } }; 'languages': { name: 'languages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; }; }; } }; 'country': { name: 'country'; type: { kind: 'OBJECT'; name: 'Country'; ofType: null; } }; 'countries': { name: 'countries'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Country'; ofType: null; }; }; }; } }; }; };
  };
};

import * as gqlTada from 'gql.tada';

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection
  }
}