import { Field, Float, ID, InputType, InterfaceType, registerEnumType } from "@nestjs/graphql";

@InterfaceType()
export abstract class VideoContent {
    @Field()
    readonly src: string
}

export enum VideoResponseStateEnum {
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    FINISHED = 'FINISHED'
}
registerEnumType(VideoResponseStateEnum, { name: 'VideoResponseStateEnum' })

@InputType()
export class VideoResponseCreateInput {
    @Field(type => ID)
    readonly blockId: string

    @Field(type => VideoResponseStateEnum)
    readonly state: VideoResponseStateEnum

    @Field(type => Float)
    position?: number
}