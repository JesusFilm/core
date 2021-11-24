import { Directive, Field, ID, InputType, ObjectType } from '@nestjs/graphql'
import { ThemeMode, ThemeName } from '../theme/theme.models'

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class Journey {
  @Field(type => ID, {name: 'id'})
  @Directive('@external')
  readonly _key: string

  @Field(type => Boolean)
  readonly published: boolean

  @Field()
  readonly title: string

  @Field()
  readonly locale: string

  @Field(type => ThemeMode)
  readonly themeMode: ThemeMode

  @Field(type => ThemeName)
  readonly themeName: ThemeName

  @Field({ nullable: true })
  readonly description?: string

  @Field()
  readonly slug: string

  readonly primaryImageBlockId: string
}

@InputType()
export class JourneyInput {
  @Field(type => Boolean)
  readonly published: boolean

  @Field()
  readonly title: string

  @Field()
  readonly locale: string

  @Field()
  readonly themeMode: string

  @Field()
  readonly themeName: string

  @Field({ nullable: true })
  readonly description?: string

  @Field({
    description:
      'Slug should be unique amongst all journeys (server will throw BAD_USER_INPUT error if not)'
  })
  readonly slug: string
}
