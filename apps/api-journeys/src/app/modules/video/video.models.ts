import { Field, Float, ID, InputType, InterfaceType, ObjectType, registerEnumType, ResolveField } from "@nestjs/graphql";

@InterfaceType({
    resolveType(obj) {
        if (obj.hasOwnProperty('mediaComponentId'))
            return VideoArclight;
        return VideoGeneric;
    }
})
export abstract class VideoContent {
    @Field()
    src: string // | (() => string)
}

@ObjectType({ implements: () => VideoContent})
export class VideoArclight extends VideoContent {
    @Field()
    readonly mediaComponentId: string

    @Field()
    readonly languageId: string

    // @ResolveField(type => String)
    // src() {
    //   return `https://arc.gt/hls/${this.mediaComponentId}/${this.languageId}`
    // }
}

@ObjectType({ implements: () => VideoContent})
export class VideoGeneric extends VideoContent {}

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