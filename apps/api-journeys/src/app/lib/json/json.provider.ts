import { CustomScalar, Scalar } from '@nestjs/graphql'
import { Kind, ValueNode } from 'graphql'

import { Json } from '../../__generated__/graphql'

@Scalar('Json')
export class JsonScalar implements CustomScalar<string, Json | null> {
  description = 'DateTime custom scalar'

  serialize(value: string): Json {
    return value
  }

  parseValue(value: Json): string {
    return value
  }

  parseLiteral(ast: ValueNode): Json | null {
    if (ast.kind === Kind.STRING) {
      return JSON.stringify(ast.value)
    }
    return null
  }
}
