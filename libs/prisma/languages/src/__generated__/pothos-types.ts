/* eslint-disable */
import type { Prisma, Language, LanguageName, Country, CountryLanguage, CountryName, Continent, ContinentName, AudioPreview, ImportTimes, UserLanguageRole } from "./client/client.js";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
    Language: {
        Name: "Language";
        Shape: Language;
        Include: Prisma.LanguageInclude;
        Select: Prisma.LanguageSelect;
        OrderBy: Prisma.LanguageOrderByWithRelationInput;
        WhereUnique: Prisma.LanguageWhereUniqueInput;
        Where: Prisma.LanguageWhereInput;
        Create: {};
        Update: {};
        RelationName: "name" | "nameLanguage" | "countries" | "countryName" | "audioPreview" | "countryLanguages" | "continentNames";
        ListRelations: "name" | "nameLanguage" | "countries" | "countryName" | "countryLanguages" | "continentNames";
        Relations: {
            name: {
                Shape: LanguageName[];
                Name: "LanguageName";
                Nullable: false;
            };
            nameLanguage: {
                Shape: LanguageName[];
                Name: "LanguageName";
                Nullable: false;
            };
            countries: {
                Shape: Country[];
                Name: "Country";
                Nullable: false;
            };
            countryName: {
                Shape: CountryName[];
                Name: "CountryName";
                Nullable: false;
            };
            audioPreview: {
                Shape: AudioPreview | null;
                Name: "AudioPreview";
                Nullable: true;
            };
            countryLanguages: {
                Shape: CountryLanguage[];
                Name: "CountryLanguage";
                Nullable: false;
            };
            continentNames: {
                Shape: ContinentName[];
                Name: "ContinentName";
                Nullable: false;
            };
        };
    };
    LanguageName: {
        Name: "LanguageName";
        Shape: LanguageName;
        Include: Prisma.LanguageNameInclude;
        Select: Prisma.LanguageNameSelect;
        OrderBy: Prisma.LanguageNameOrderByWithRelationInput;
        WhereUnique: Prisma.LanguageNameWhereUniqueInput;
        Where: Prisma.LanguageNameWhereInput;
        Create: {};
        Update: {};
        RelationName: "language" | "parent";
        ListRelations: never;
        Relations: {
            language: {
                Shape: Language;
                Name: "Language";
                Nullable: false;
            };
            parent: {
                Shape: Language;
                Name: "Language";
                Nullable: false;
            };
        };
    };
    Country: {
        Name: "Country";
        Shape: Country;
        Include: Prisma.CountryInclude;
        Select: Prisma.CountrySelect;
        OrderBy: Prisma.CountryOrderByWithRelationInput;
        WhereUnique: Prisma.CountryWhereUniqueInput;
        Where: Prisma.CountryWhereInput;
        Create: {};
        Update: {};
        RelationName: "name" | "languages" | "countryLanguages" | "continent";
        ListRelations: "name" | "languages" | "countryLanguages";
        Relations: {
            name: {
                Shape: CountryName[];
                Name: "CountryName";
                Nullable: false;
            };
            languages: {
                Shape: Language[];
                Name: "Language";
                Nullable: false;
            };
            countryLanguages: {
                Shape: CountryLanguage[];
                Name: "CountryLanguage";
                Nullable: false;
            };
            continent: {
                Shape: Continent | null;
                Name: "Continent";
                Nullable: true;
            };
        };
    };
    CountryLanguage: {
        Name: "CountryLanguage";
        Shape: CountryLanguage;
        Include: Prisma.CountryLanguageInclude;
        Select: Prisma.CountryLanguageSelect;
        OrderBy: Prisma.CountryLanguageOrderByWithRelationInput;
        WhereUnique: Prisma.CountryLanguageWhereUniqueInput;
        Where: Prisma.CountryLanguageWhereInput;
        Create: {};
        Update: {};
        RelationName: "language" | "country";
        ListRelations: never;
        Relations: {
            language: {
                Shape: Language;
                Name: "Language";
                Nullable: false;
            };
            country: {
                Shape: Country;
                Name: "Country";
                Nullable: false;
            };
        };
    };
    CountryName: {
        Name: "CountryName";
        Shape: CountryName;
        Include: Prisma.CountryNameInclude;
        Select: Prisma.CountryNameSelect;
        OrderBy: Prisma.CountryNameOrderByWithRelationInput;
        WhereUnique: Prisma.CountryNameWhereUniqueInput;
        Where: Prisma.CountryNameWhereInput;
        Create: {};
        Update: {};
        RelationName: "country" | "language";
        ListRelations: never;
        Relations: {
            country: {
                Shape: Country;
                Name: "Country";
                Nullable: false;
            };
            language: {
                Shape: Language;
                Name: "Language";
                Nullable: false;
            };
        };
    };
    Continent: {
        Name: "Continent";
        Shape: Continent;
        Include: Prisma.ContinentInclude;
        Select: Prisma.ContinentSelect;
        OrderBy: Prisma.ContinentOrderByWithRelationInput;
        WhereUnique: Prisma.ContinentWhereUniqueInput;
        Where: Prisma.ContinentWhereInput;
        Create: {};
        Update: {};
        RelationName: "name" | "countries";
        ListRelations: "name" | "countries";
        Relations: {
            name: {
                Shape: ContinentName[];
                Name: "ContinentName";
                Nullable: false;
            };
            countries: {
                Shape: Country[];
                Name: "Country";
                Nullable: false;
            };
        };
    };
    ContinentName: {
        Name: "ContinentName";
        Shape: ContinentName;
        Include: Prisma.ContinentNameInclude;
        Select: Prisma.ContinentNameSelect;
        OrderBy: Prisma.ContinentNameOrderByWithRelationInput;
        WhereUnique: Prisma.ContinentNameWhereUniqueInput;
        Where: Prisma.ContinentNameWhereInput;
        Create: {};
        Update: {};
        RelationName: "continent" | "language";
        ListRelations: never;
        Relations: {
            continent: {
                Shape: Continent;
                Name: "Continent";
                Nullable: false;
            };
            language: {
                Shape: Language;
                Name: "Language";
                Nullable: false;
            };
        };
    };
    AudioPreview: {
        Name: "AudioPreview";
        Shape: AudioPreview;
        Include: Prisma.AudioPreviewInclude;
        Select: Prisma.AudioPreviewSelect;
        OrderBy: Prisma.AudioPreviewOrderByWithRelationInput;
        WhereUnique: Prisma.AudioPreviewWhereUniqueInput;
        Where: Prisma.AudioPreviewWhereInput;
        Create: {};
        Update: {};
        RelationName: "language";
        ListRelations: never;
        Relations: {
            language: {
                Shape: Language;
                Name: "Language";
                Nullable: false;
            };
        };
    };
    ImportTimes: {
        Name: "ImportTimes";
        Shape: ImportTimes;
        Include: never;
        Select: Prisma.ImportTimesSelect;
        OrderBy: Prisma.ImportTimesOrderByWithRelationInput;
        WhereUnique: Prisma.ImportTimesWhereUniqueInput;
        Where: Prisma.ImportTimesWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    UserLanguageRole: {
        Name: "UserLanguageRole";
        Shape: UserLanguageRole;
        Include: never;
        Select: Prisma.UserLanguageRoleSelect;
        OrderBy: Prisma.UserLanguageRoleOrderByWithRelationInput;
        WhereUnique: Prisma.UserLanguageRoleWhereUniqueInput;
        Where: Prisma.UserLanguageRoleWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
}
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"Language\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"bcp47\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"iso3\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"hasVideos\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"LanguageName\",\"kind\":\"object\",\"name\":\"name\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"name\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"LanguageName\",\"kind\":\"object\",\"name\":\"nameLanguage\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"nameLanguage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Country\",\"kind\":\"object\",\"name\":\"countries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CountryToLanguage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"CountryName\",\"kind\":\"object\",\"name\":\"countryName\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CountryNameToLanguage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AudioPreview\",\"kind\":\"object\",\"name\":\"audioPreview\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AudioPreviewToLanguage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"CountryLanguage\",\"kind\":\"object\",\"name\":\"countryLanguages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CountryLanguageToLanguage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ContinentName\",\"kind\":\"object\",\"name\":\"continentNames\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ContinentNameToLanguage\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"LanguageName\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"parentLanguageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Language\",\"kind\":\"object\",\"name\":\"language\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"nameLanguage\",\"relationFromFields\":[\"languageId\"],\"isUpdatedAt\":false},{\"type\":\"Language\",\"kind\":\"object\",\"name\":\"parent\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"name\",\"relationFromFields\":[\"parentLanguageId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"parentLanguageId\",\"languageId\"]}]},\"Country\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"CountryName\",\"kind\":\"object\",\"name\":\"name\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CountryToCountryName\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"population\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"continentId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Float\",\"kind\":\"scalar\",\"name\":\"latitude\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Float\",\"kind\":\"scalar\",\"name\":\"longitude\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"flagPngSrc\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"flagWebpSrc\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Language\",\"kind\":\"object\",\"name\":\"languages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CountryToLanguage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"CountryLanguage\",\"kind\":\"object\",\"name\":\"countryLanguages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CountryToCountryLanguage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Continent\",\"kind\":\"object\",\"name\":\"continent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ContinentToCountry\",\"relationFromFields\":[\"continentId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"CountryLanguage\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"countryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"speakers\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"displaySpeakers\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"suggested\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"order\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Language\",\"kind\":\"object\",\"name\":\"language\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CountryLanguageToLanguage\",\"relationFromFields\":[\"languageId\"],\"isUpdatedAt\":false},{\"type\":\"Country\",\"kind\":\"object\",\"name\":\"country\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CountryToCountryLanguage\",\"relationFromFields\":[\"countryId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"languageId\",\"countryId\",\"suggested\"]}]},\"CountryName\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"countryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Country\",\"kind\":\"object\",\"name\":\"country\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CountryToCountryName\",\"relationFromFields\":[\"countryId\"],\"isUpdatedAt\":false},{\"type\":\"Language\",\"kind\":\"object\",\"name\":\"language\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CountryNameToLanguage\",\"relationFromFields\":[\"languageId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"languageId\",\"countryId\"]}]},\"Continent\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"ContinentName\",\"kind\":\"object\",\"name\":\"name\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ContinentToContinentName\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Country\",\"kind\":\"object\",\"name\":\"countries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ContinentToCountry\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ContinentName\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"continentId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Continent\",\"kind\":\"object\",\"name\":\"continent\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ContinentToContinentName\",\"relationFromFields\":[\"continentId\"],\"isUpdatedAt\":false},{\"type\":\"Language\",\"kind\":\"object\",\"name\":\"language\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ContinentNameToLanguage\",\"relationFromFields\":[\"languageId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"languageId\",\"continentId\"]}]},\"AudioPreview\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"duration\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"size\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"bitrate\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"codec\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Language\",\"kind\":\"object\",\"name\":\"language\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AudioPreviewToLanguage\",\"relationFromFields\":[\"languageId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ImportTimes\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"modelName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastImport\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"UserLanguageRole\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"LanguageRole\",\"kind\":\"enum\",\"name\":\"roles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]}}}}"); }