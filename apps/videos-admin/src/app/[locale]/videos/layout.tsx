import { ReactNode } from 'react'

import { ApolloWrapper } from '../_apolloWrapper/apolloWrapper'

export default function LocaleLayout({
  children
}: {
  children: React.ReactNode
}): ReactNode {
  return <ApolloWrapper>{children}</ApolloWrapper>
}
