import { CustomScalar, Scalar } from '@nestjs/graphql'
import { Kind, ValueNode } from 'graphql'

@Scalar('DateTime')
export class DateTimeScalar implements CustomScalar<string, Date | null> {
  description = 'DateTime custom scalar'

  parseValue(value: number): Date {
    return new Date(value) // value from the client
  }

  serialize(value: string): string {
    return new Date(value).toISOString()
  }

  parseLiteral(ast: ValueNode): Date | null {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value)
    }
    return null
  }
}
