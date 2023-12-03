import { CustomScalar, Scalar } from '@nestjs/graphql'
import { Kind, ValueNode } from 'graphql'

import { JSON } from '../../__generated__/graphql'

@Scalar('JSON')
export class JsonScalar implements CustomScalar<string, JSON | null> {
  description = 'DateTime custom scalar'

  serialize(value: string): JSON {
    return value
  }

  parseValue(value: JSON): string {
    return value
  }

  parseLiteral(ast: ValueNode): JSON | null {
    if (ast.kind === Kind.STRING) {
      return JSON.stringify(ast.value)
    }
    return null
  }
}
