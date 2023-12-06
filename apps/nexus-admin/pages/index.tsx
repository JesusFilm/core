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
import { AuthAction, withUser } from 'next-firebase-auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CreateNexusModal } from '../src/components/CreateNexusModal'
import { Loader } from '../src/components/Loader'

const GET_NEXUSES = gql`
  query {
    nexuses {
      id
      name
      description
    }
  }
`

type NexusApp = {
  id: string
  name: string
  description: string
}

export function Index() {
  // const user = useUser()
  const [nexusApps, setNexusApps] = useState<NexusApp[] | []>([])
  const [openCreateNexusModal, setOpenCreateNexusModal] =
    useState<boolean>(false)
  const router = useRouter()

  // const logout = async () => {
  //   await user.signOut()
  // }

  const { loading } = useQuery(GET_NEXUSES, {
    onCompleted: ({ nexuses }) => {
      setNexusApps(nexuses)
    }
  })

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
    >
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
        <Fab color="primary" onClick={() => setOpenCreateNexusModal(true)}>
          <AddIcon />
        </Fab>
      </Box>
      {/* <Typography>Hi {user.email}!</Typography>
      <Button variant="contained" onClick={logout}>
        Log out
      </Button> */}
      <CreateNexusModal
        open={openCreateNexusModal}
        onClose={() => setOpenCreateNexusModal(false)}
      />
    </Stack>
  )
}

export default withUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  LoaderComponent: Loader
})(Index)
