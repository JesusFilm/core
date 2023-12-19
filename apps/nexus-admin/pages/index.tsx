import { gql, useQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Fab,
  Stack,
  Typography
} from '@mui/material'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Nexuses, Nexuses_nexuses } from '../__generated__/Nexuses'
import { CreateNexusModal } from '../src/components/CreateNexusModal'
import { Loader } from '../src/components/Loader'

export const GET_NEXUSES = gql`
  query Nexuses {
    nexuses {
      id
      name
      description
    }
  }
`

export function Index() {
  const [nexusApps, setNexusApps] = useState<Nexuses_nexuses[]>([])
  const [openCreateNexusModal, setOpenCreateNexusModal] =
    useState<boolean>(false)
  const router = useRouter()

  const { data, loading } = useQuery<Nexuses>(GET_NEXUSES)

  useEffect(() => {
    if (data) {
      setNexusApps(data.nexuses)
    }
  }, [data])

  if (loading) {
    return <Loader />
  }

  const redirectToDashboard = (nexusId: string) => {
    localStorage.setItem('nexusId', nexusId)
    router.push('/channels')
  }

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh' }}
      spacing={4}
    >
      {nexusApps.length > 0 ? (
        <Box
          display="grid"
          gridTemplateColumns="repeat(4, 1fr)"
          alignItems="center"
          gap={4}
        >
          {nexusApps.map((nexusApp) => (
            <Box gridColumn="span 1" key={nexusApp.id}>
              <Card key={nexusApp.id} sx={{ maxWidth: 345, minWidth: 200 }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {nexusApp.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {nexusApp.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button onClick={() => redirectToDashboard(nexusApp.id)}>
                    Select
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography>
          You currently don't have nexus apps. Please start by creating one.
        </Typography>
      )}
      <Fab color="primary" onClick={() => setOpenCreateNexusModal(true)}>
        <AddIcon />
      </Fab>
      <CreateNexusModal
        open={openCreateNexusModal}
        onClose={() => setOpenCreateNexusModal(false)}
      />
    </Stack>
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
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  LoaderComponent: Loader
})(Index)
