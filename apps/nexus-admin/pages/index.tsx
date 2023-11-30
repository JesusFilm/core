import { Button, Typography } from '@mui/material'
import { AuthAction, useUser, withUser } from 'next-firebase-auth'
import { Loader } from '../src/components/Loader'
import { MainLayout } from '../src/components/MainLayout'

export function Index() {
  const user = useUser()

  const logout = async () => {
    await user.signOut()
  }

  return (
    <MainLayout>
      <Typography>Hi {user.email}!</Typography>
      <Button variant="contained" onClick={logout}>
        Log out
      </Button>
    </MainLayout>
  )
}

export default withUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  LoaderComponent: Loader
})(Index)
