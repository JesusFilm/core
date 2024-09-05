import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ReactNode } from 'react'

import minimalLogo from '../../../../assets/minimal-logo.png'
import { CenterPage } from '../../../../components/CenterPage'
import { makeClient } from '../../../../libs/apollo/makeClient'
import { getUser } from '../../../../libs/auth/getUser'

import { Logout } from './_Logout'

const GET_AUTH = graphql(`
  query me {
    me {
      id
    }
  }
`)

export default async function UnauthorizedPage(): Promise<ReactNode> {
  const t = await getTranslations()
  const user = await getUser()
  const { data } = await makeClient({
    headers: { Authorization: user?.token ?? '' }
  }).query({
    query: GET_AUTH
  })

  return (
    <CenterPage>
      <Image
        src={minimalLogo}
        alt={t('Jesus Film Project')}
        width={100}
        height={100}
      />
      <Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          {t('401 Unauthorized')}
        </Typography>
        <Typography>
          {t(
            "We couldn't validate your credentials. Please ask an administrator to add the necessary role to your account by forwarding them your ID & User ID."
          )}
        </Typography>
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>{t('You need to create a UserMediaRole record')}</strong>
            <ol>
              <li>{t('Open Prisma Studio for api-media')}</li>
              <li>{t('Select the UserMediaRole model')}</li>
              <li>
                {t(
                  'Add a record with the id and userId below with at least one role'
                )}
              </li>
              <li>{t('Sign out and back in again')}</li>
            </ol>
          </Alert>
        )}
      </Box>
      <FormControl>
        <FormLabel htmlFor="id">{t('ID')}</FormLabel>
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
        <FormLabel htmlFor="uid">{t('User ID')}</FormLabel>
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
