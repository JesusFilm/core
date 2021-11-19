import { ThemeMode, ThemeName } from "./theme.interface";

export interface IJourney {
    _key: string;
    published: boolean;
    title: string;
    locale: string;
    themeMode: ThemeMode;
    themeName: ThemeName;
    description?: string;
    slug: string;    
  }
