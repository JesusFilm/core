import {
  ReactElement,
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'

const AuthContext = createContext(undefined)

export function useAuth(): void {
  return useContext(AuthContext)
}

export function AuthProvider({ children }): ReactElement {
  const [currentUser, setCurrentUser] = useState()

  // const uiConfig = {
  //     signInFlow: 'popup',
  //     signInSuccessUrl: '/journeys',
  //     signInOptions: [
  //         firebase.auth.EmailAuthProvider.PROVIDER_ID,
  //         firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  //         firebase.auth.FacebookAuthProvider.PROVIDER_ID
  //     ],
  //     callbacks: {
  //         signInSuccessWithAuthResult: () => true
  //     }
  // }

  useEffect(() => {
    const unregisterAuthOberserver = firebase
      .auth()
      .onAuthStateChanged((user) => {
        setCurrentUser(user)
      })
    return unregisterAuthOberserver()
  }, [])

  const value = {
    currentUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
