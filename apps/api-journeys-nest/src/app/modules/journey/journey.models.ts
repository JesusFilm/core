import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ThemeMode, ThemeName } from '../../interfaces/theme.interface';

@ObjectType()
export class JourneyType {
  @Field(type => String)
  readonly _key: string;

  @Field(type => Boolean)
  readonly published: boolean;

  @Field(type => String)
  readonly title: string;

  @Field(type => String)
  readonly locale: string;

  @Field(type => ThemeMode)
  readonly themeMode: ThemeMode;

  @Field(type => ThemeName)
  readonly themeName: ThemeName;

  @Field(type => String, { nullable: true })
  readonly description?: string;

  @Field(type => String)
  readonly slug: string;
}

@InputType()
export class JourneyInput {
  @Field(type => Boolean)
  readonly published: boolean;

  @Field(type => String)
  readonly title: string;

  @Field(type => String)
  readonly locale: string;

  @Field(type => ThemeMode)
  readonly themeMode: ThemeMode;

  @Field(type => ThemeName)
  readonly themeName: ThemeName;

  @Field(type => String, { nullable: true })
  readonly description?: string;

  @Field(type => String)
  readonly slug: string;
}

@ObjectType()
export enum ThemeModeType {
  @Field(type => ThemeMode)
  readonly ThemeMode: ThemeMode
}

