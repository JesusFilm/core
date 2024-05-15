import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { FC, useEffect, useState } from 'react'

import { BatchesTable } from '../../src/components/BatchesTable'
import { PageWrapper } from '../../src/components/PageWrapper'

const GET_BATCHES = gql`
  query Batches($where: BatchFilter) {
    batches(where: $where) {
      id
      name
      status
      progress
      createdAt
      tasks {
        type
        status
        progress
        metadata
        error
      }
    }
  }
`

const BatchesPage: FC = () => {
  const nexusId =
    typeof window !== 'undefined' ? localStorage.getItem('nexusId') : ''
  const [batches, setBatches] = useState([])

  const { data, loading } = useQuery(GET_BATCHES, {
    variables: {
      where: {
        nexusId
      }
    },
    pollInterval: 2000
  })

  useEffect(() => {
    if (data !== undefined) {
      setBatches(data?.batches)
    }
  }, [data])

  return (
    <PageWrapper title="Batch Jobs">
      <Stack
        sx={{
          pt: 4
        }}
      >
        <BatchesTable loading={loading} data={batches} />
      </Stack>
    </PageWrapper>
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
