import { ThemeMode, ThemeName } from "../../../interfaces/theme.interface";

export class CreateJourneyDto {
  _key: string;
  published: boolean;
  title: string;
  locale: string;
  themeMode: ThemeMode;
  themeName: ThemeName;
  description?: string;
  slug: string;    
}

