import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactNode } from 'react'

import { graphql } from '@core/shared/gql'

import minimalLogo from '../../../assets/minimal-logo.png'
import { CenterPage } from '../../../components/CenterPage'
import { makeClient } from '../../../libs/apollo/makeClient'
import { getUser } from '../../../libs/auth/getUser'

import { Logout } from './_logout'

const GET_AUTH = graphql(`
  query me {
    me {
      id
    }
  }
`)

export default async function UnauthorizedPage(): Promise<ReactNode> {
  const user = await getUser()
  const { data } = await makeClient({
    headers: { Authorization: user?.token != null ? `JWT ${user.token}` : '' }
  }).query({
    query: GET_AUTH
  })

  return (
    <CenterPage>
      <Image
        src={minimalLogo}
        alt="Jesus Film Project"
        width={100}
        height={100}
      />
      <Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          401 Unauthorized
        </Typography>
        <Typography>
          We couldn't validate your credentials. Please ask an administrator to
          add the necessary role to your account by forwarding them your ID &
          User ID.
        </Typography>
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography component="p" fontWeight="bold">
              You need to create a UserMediaRole or UserLanguageRole record
            </Typography>
            <List component="ol" dense sx={{ listStyle: 'decimal', pl: 3 }}>
              {[
                'Open Prisma Studio for api-media or api-languages',
                'Select the UserMediaRole or UserLanguageRole model',
                'Add a record with the id and userId below with at least one role',
                'Sign out and back in again'
              ].map((instruction) => (
                <ListItem
                  component="li"
                  disablePadding
                  key={instruction}
                  sx={{ display: 'list-item' }}
                >
                  <ListItemText primary={instruction} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
      </Box>
      <FormControl>
        <FormLabel htmlFor="id">ID</FormLabel>
        <TextField
          id="id"
          name="id"
          value={data.me?.id}
          fullWidth
          slotProps={{
            input: {
              readOnly: true
            }
          }}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="uid">User ID</FormLabel>
        <TextField
          id="uid"
          name="uid"
          value={user?.uid}
          fullWidth
          slotProps={{
            input: {
              readOnly: true
            }
          }}
        />
      </FormControl>
      <Logout />
    </CenterPage>
  )
}
