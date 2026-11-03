import { useRedirectParam } from './useRedirectParam'

function isSameOriginPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//')
}

export function useRedirectAfterLogin(): () => void {
  const redirect = useRedirectParam()

  return function () {
    // Full-page navigation, not router.push: if the proxy bounces the request
    // back to /users/sign-in, a soft navigation keeps the sign-in page mounted
    // with its post-login spinner showing forever.
    window.location.assign(
      redirect != null && isSameOriginPath(redirect) ? redirect : '/'
    )
  }
}
