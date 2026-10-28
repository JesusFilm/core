import Image from 'next/image'
import { ReactNode } from 'react'

import { graphql } from '@core/shared/gql'

import minimalLogo from '../../../assets/minimal-logo.png'
import { CenterPage } from '../../../components/CenterPage'
import { makeClient } from '../../../libs/apollo/makeClient'
import { getUser } from '../../../libs/auth/getUser'

import { Logout } from './_logout'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const GET_AUTH = graphql(`
  query me {
    me {
      id
    }
  }
`)

const INSTRUCTIONS = [
  'Open Prisma Studio for api-media',
  'Select the UserMediaRole model',
  'Add a record with the id and userId below and the shortLinkEditor or shortLinkAdmin role',
  'Sign out and back in again'
]

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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">401 Unauthorized</h1>
        <p className="text-muted-foreground text-sm">
          We couldn&apos;t validate your credentials. Please ask an
          administrator to add the necessary role to your account by forwarding
          them your ID &amp; User ID.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <Alert variant="warning">
            <AlertTitle>
              You need a UserMediaRole record with shortLinkEditor or
              shortLinkAdmin
            </AlertTitle>
            <AlertDescription>
              <ol className="list-decimal ps-4">
                {INSTRUCTIONS.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Field name="id">
        <FieldLabel htmlFor="id">ID</FieldLabel>
        <Input
          id="id"
          name="id"
          value={data?.me?.id ?? ''}
          readOnly
          className="w-full"
        />
      </Field>
      <Field name="uid">
        <FieldLabel htmlFor="uid">User ID</FieldLabel>
        <Input
          id="uid"
          name="uid"
          value={user?.uid ?? ''}
          readOnly
          className="w-full"
        />
      </Field>
      <Logout />
    </CenterPage>
  )
}
