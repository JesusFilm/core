import { Field, InterfaceType } from "@nestjs/graphql";

@InterfaceType()
export abstract class Block {
    @Field()
    readonly _key: string;

    @Field()
    readonly parentBlockKey?: string;
}
