/* eslint-disable */
import type { Prisma, Language, LanguageName, Country, CountryLanguage, CountryName, CountryContinent, AudioPreview, ImportTimes } from ".prisma/api-languages-client";
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
        RelationName: "name" | "nameLanguage" | "countries" | "countryName" | "countryContinent" | "audioPreview" | "countryLanguages";
        ListRelations: "name" | "nameLanguage" | "countries" | "countryName" | "countryContinent" | "countryLanguages";
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
            countryContinent: {
                Shape: CountryContinent[];
                Name: "CountryContinent";
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
        RelationName: "name" | "continent" | "languages" | "countryLanguages";
        ListRelations: "name" | "continent" | "languages" | "countryLanguages";
        Relations: {
            name: {
                Shape: CountryName[];
                Name: "CountryName";
                Nullable: false;
            };
            continent: {
                Shape: CountryContinent[];
                Name: "CountryContinent";
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
    CountryContinent: {
        Name: "CountryContinent";
        Shape: CountryContinent;
        Include: Prisma.CountryContinentInclude;
        Select: Prisma.CountryContinentSelect;
        OrderBy: Prisma.CountryContinentOrderByWithRelationInput;
        WhereUnique: Prisma.CountryContinentWhereUniqueInput;
        Where: Prisma.CountryContinentWhereInput;
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
}