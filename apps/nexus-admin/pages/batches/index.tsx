import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { FC, useEffect, useState } from 'react'

import { Batches_batches } from '../../__generated__/Batches'
import { BatchesTable } from '../../src/components/BatchesTable'
import { MainLayout } from '../../src/components/MainLayout'

const GET_BATCHES = gql`
  query Batches($where: BatchFilter) {
    batches(where: $where) {
      id
      name
      status
      progress
      createdAt
      batchTasks {
        type
        status
        progress
        task
        error
      }
    }
  }
`

const BatchesPage: FC = () => {
  const [batches, setBatches] = useState<Batches_batches[]>([])

  const { data, loading } = useQuery(GET_BATCHES, {
    pollInterval: 2000
  })

  useEffect(() => {
    if (data !== undefined) {
      setBatches(data?.batches as Batches_batches[])
    }
  }, [data])

  return (
    <MainLayout title="Batch Jobs">
      <Stack
        sx={{
          pt: 4
        }}
      >
        <BatchesTable loading={loading} data={batches} />
      </Stack>
    </MainLayout>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user }) => {
  const token = await user?.getIdToken()

  return {
    props: {
      token
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(BatchesPage)
