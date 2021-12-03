/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum JourneyStatus {
  draft = "draft",
  published = "published",
}

export enum ThemeMode {
  dark = "dark",
  light = "light",
}

export enum ThemeName {
  base = "base",
}

export interface JourneyUpdateInput {
  description?: string | null;
  id: string;
  locale?: string | null;
  primaryImageBlockId?: string | null;
  slug?: string | null;
  themeMode?: ThemeMode | null;
  themeName?: ThemeName | null;
  title?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
