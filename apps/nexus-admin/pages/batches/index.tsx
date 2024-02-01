import { gql, useQuery, useSubscription } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { FC } from 'react'

import { BatchesTable } from '../../src/components/BatchesTable'
import { MainLayout } from '../../src/components/MainLayout'

const GET_BATCHES = gql`
  query Batches($where: BatchFilter) {
    batches(where: $where) {
      id
      resourceId
      name
      status
    }
  }
`

const BATCHES_SUBSCRIPTION = gql`
  subscription BatchStatusChanged($id: string) {
    batchStatusChanged(id: $id) {
      id
      resourceId
      name
      status
    }
  }
`

const BatchesPage: FC = () => {
  const nexusId =
    typeof window !== 'undefined' ? localStorage.getItem('nexusId') : ''

  const { data, loading } = useQuery(GET_BATCHES, {
    variables: {
      where: {
        nexusId
      }
    }
  })

  const { data: statusData } = useSubscription(BATCHES_SUBSCRIPTION, {
    variables: {
      id: '1'
    }
  })

  return (
    <MainLayout title="Batch Jobs">
      <Stack
        sx={{
          pt: 4
        }}
      >
        <BatchesTable loading={loading} data={data} />
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
