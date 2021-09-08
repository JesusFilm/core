import { ReactElement } from 'react'
import { Conductor } from '../src/components/Conductor'
import Link from 'next/link'
import { BlockType } from '../src/types'
import { data1, data2, data3 } from '../src/data'
import transformer from '../src/libs/transformer'
import { useRouter } from 'next/dist/client/router'
import { Container, Typography } from '@mui/material'
import { Provider } from 'react-redux'
import { store } from '../src/libs/store/store'

function Slug (): ReactElement {
  const { query: { slug } } = useRouter()

  return (
    <Container>
      <Typography variant="h1">Block renderer and conductor samples</Typography>
      <Link href="/example-1">Example 1.</Link>
      <Link href="/example-2">Example 2.</Link>
      <Link href="/example-3">Example 3.</Link>
      <Provider store={store}>
        {slug === 'example-1' && <Conductor blocks={transformer<BlockType>(data1)} />}
        {slug === 'example-2' && <Conductor blocks={transformer<BlockType>(data2)} />}
        {slug === 'example-3' && <Conductor blocks={transformer<BlockType>(data3)} />}
      </Provider>
    </Container>
  )
}

export default Slug
