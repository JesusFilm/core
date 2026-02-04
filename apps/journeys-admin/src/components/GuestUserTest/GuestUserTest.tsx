import { useEffect, useRef, useState } from 'react'

import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getApp } from 'firebase/app'
import {
  EmailAuthProvider,
  getAuth,
  linkWithCredential,
  signInAnonymously,
  updateProfile
} from 'firebase/auth'
import { useUser } from 'next-firebase-auth'

import { JourneyProfileCreate } from '../../../__generated__/JourneyProfileCreate'
import { useCurrentUserLazyQuery } from '../../libs/useCurrentUserLazyQuery'

const JOURNEY_PROFILE_CREATE = gql`
  mutation JourneyProfileCreate {
    journeyProfileCreate {
      id
      userId
      acceptedTermsAt
    }
  }
`

const MERGE_GUEST = gql`
  mutation MergeGuest($input: MergeGuestInput!) {
    mergeGuest(input: $input) {
      id
      userId
      email
      firstName
      lastName
      emailVerified
    }
  }
`
const count = 2

const MERGE_GUEST_DISPLAY_NAME = 'John Doe'
const MERGE_GUEST_EMAIL = `testemail${count}@example.com`
const MERGE_GUEST_PASSWORD = 'MergeGuestTest1'

export function GuestUserTest() {
  const user = useUser()
  const { loadUser, data: dbUser } = useCurrentUserLazyQuery()
  const hasAttemptedAnonymousSignIn = useRef(false)
  const [journeyProfileCreate] = useMutation<JourneyProfileCreate>(
    JOURNEY_PROFILE_CREATE
  )
  const [mergeGuest] = useMutation(MERGE_GUEST)
  const [isCreatingGuest, setIsCreatingGuest] = useState(false)
  const [createGuestError, setCreateGuestError] = useState<string | null>(null)
  const [isMergingGuest, setIsMergingGuest] = useState(false)
  const [mergeGuestError, setMergeGuestError] = useState<string | null>(null)

  // Current user: useUser() gives id, email, displayName, etc. When not signed in, user.id is null.
  const currentUserId = user.id ?? null
  const isSignedIn = currentUserId != null

  // Anonymous check: firebaseUser is the Firebase JS SDK user (only set after client init).
  // Firebase User has isAnonymous: https://firebase.google.com/docs/reference/js/auth.user#userisanonymous
  const isAnonymous = user.firebaseUser?.isAnonymous ?? false

  // When signed out and Firebase client is ready, sign in anonymously so we can show the anonymous ID.
  useEffect(() => {
    if (
      !isSignedIn &&
      user.clientInitialized &&
      !hasAttemptedAnonymousSignIn.current
    ) {
      hasAttemptedAnonymousSignIn.current = true
      signInAnonymously(getAuth(getApp())).catch(() => {
        hasAttemptedAnonymousSignIn.current = false
      })
    }
  }, [isSignedIn, user.clientInitialized])

  useEffect(() => {
    if (isSignedIn) {
      loadUser()
    }
  }, [isSignedIn, loadUser])

  function getErrorMessage(err: unknown, prefix: string): string {
    if (err == null) return `${prefix}: Unknown error`
    const apolloErr = err as {
      message?: string
      graphQLErrors?: Array<{ message?: string }>
      networkError?: { message?: string; result?: { error?: string } }
    }
    const gqlMessage = apolloErr.graphQLErrors?.[0]?.message
    const networkMessage =
      apolloErr.networkError?.result?.error ?? apolloErr.networkError?.message
    const message =
      gqlMessage ?? networkMessage ?? apolloErr.message ?? String(err)
    return `${prefix}: ${message}`
  }

  // Create guest: use me query with createGuestIfAnonymous (creates DB user via findOrFetchUser), then journey profile
  const handleCreateGuest = async (): Promise<void> => {
    setCreateGuestError(null)
    setIsCreatingGuest(true)
    try {
      try {
        await loadUser({
          variables: { input: { createGuestIfAnonymous: true } }
        })
      } catch (err) {
        setCreateGuestError(getErrorMessage(err, 'Create guest user'))
        return
      }
      try {
        await journeyProfileCreate()
      } catch (err) {
        setCreateGuestError(getErrorMessage(err, 'Create journey profile'))
        return
      }
      try {
        await loadUser()
      } catch (err) {
        setCreateGuestError(getErrorMessage(err, 'Load user'))
      }
    } finally {
      setIsCreatingGuest(false)
    }
  }

  const handleMergeGuest = async (): Promise<void> => {
    setMergeGuestError(null)
    setIsMergingGuest(true)
    const auth = getAuth(getApp())
    const firebaseUser = auth.currentUser
    if (firebaseUser == null) {
      setMergeGuestError('Merge guest: Not signed in')
      setIsMergingGuest(false)
      return
    }
    try {
      await updateProfile(firebaseUser, {
        displayName: MERGE_GUEST_DISPLAY_NAME
      })
    } catch (err) {
      setMergeGuestError(getErrorMessage(err, 'Merge guest (Firebase profile)'))
      setIsMergingGuest(false)
      return
    }
    try {
      const credential = EmailAuthProvider.credential(
        MERGE_GUEST_EMAIL,
        MERGE_GUEST_PASSWORD
      )
      await linkWithCredential(firebaseUser, credential)
    } catch (err) {
      setMergeGuestError(
        getErrorMessage(err, 'Merge guest (Firebase email link)')
      )
      setIsMergingGuest(false)
      return
    }
    try {
      await mergeGuest({
        variables: {
          input: {
            firstName: 'John',
            lastName: 'Doe',
            email: MERGE_GUEST_EMAIL
          }
        }
      })
    } catch (err) {
      setMergeGuestError(getErrorMessage(err, 'Merge guest (DB)'))
      setIsMergingGuest(false)
      return
    }
    try {
      await loadUser()
    } catch (err) {
      setMergeGuestError(getErrorMessage(err, 'Merge guest (reload)'))
    } finally {
      setIsMergingGuest(false)
    }
  }

  const displayName =
    dbUser != null && (dbUser.firstName || dbUser.lastName)
      ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ')
      : null

  return (
    <Stack gap={2} sx={{ border: '2px solid green', p: 4, mt: 4 }}>
      <Typography variant="h1">Guest User Test</Typography>
      <Stack gap={2} direction="row" flexWrap="wrap">
        <Card variant="outlined" sx={{ border: '2px solid orange' }}>
          <CardHeader
            title="Firebase user"
            subheader="Current auth state from Firebase"
            titleTypographyProps={{ variant: 'subtitle1' }}
          />
          <CardContent>
            <Stack gap={1}>
              {currentUserId != null && (
                <Typography variant="body2" color="text.secondary">
                  {isAnonymous ? 'Anonymous ID' : 'UID'}: {currentUserId}
                </Typography>
              )}
              {user.email != null && user.email !== '' && (
                <Typography variant="body2" color="text.secondary">
                  Email: {user.email}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Signed in: {isSignedIn ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Anonymous: {isAnonymous ? 'Yes' : 'No'}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ border: '2px solid blue' }}>
          <CardHeader
            title="Database user"
            subheader="User record from the database"
            titleTypographyProps={{ variant: 'subtitle1' }}
          />
          <CardContent>
            <Stack gap={1}>
              {dbUser != null && dbUser.userId !== '' ? (
                <>
                  <Typography variant="body2" color="text.secondary">
                    User ID: {dbUser.userId}
                  </Typography>
                  {dbUser.email != null && dbUser.email !== '' && (
                    <Typography variant="body2" color="text.secondary">
                      Email: {dbUser.email}
                    </Typography>
                  )}
                  {displayName != null && (
                    <Typography variant="body2" color="text.secondary">
                      Name: {displayName}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Email verified: {dbUser.emailVerified ? 'Yes' : 'No'}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {!isSignedIn
                    ? 'Sign in to see database user'
                    : isAnonymous
                      ? 'No database user (anonymous only)'
                      : 'Loading…'}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          onClick={() => void handleCreateGuest()}
          disabled={isCreatingGuest}
        >
          {isCreatingGuest ? 'Creating…' : 'Create Guest'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => void handleMergeGuest()}
          disabled={isMergingGuest}
        >
          {isMergingGuest ? 'Merging…' : 'Merge Guest'}
        </Button>
      </Stack>
      {createGuestError != null && (
        <Typography variant="body2" color="error">
          {createGuestError}
        </Typography>
      )}
      {mergeGuestError != null && (
        <Typography variant="body2" color="error">
          {mergeGuestError}
        </Typography>
      )}
    </Stack>
  )
}
