export type ActivePage =
  | 'home'
  | 'password'
  | 'register'
  | 'google.com'
  | 'facebook.com'
  | 'help'

export interface PageProps {
  userEmail?: string
  setUserEmail?: (userEmail: string) => void
  userPassword?: string
  setUserPassword?: (userPassword: string) => void
  activePage?: ActivePage
  setActivePage?: (activePage: ActivePage) => void
  service?: 'google.com' | 'facebook.com'
}
