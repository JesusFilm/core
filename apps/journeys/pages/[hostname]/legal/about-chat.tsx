// The page is hostname-agnostic — same content under both the root
// domain (routed to `pages/home/legal/about-chat.tsx`) and any custom
// hostname (routed here by the `apps/journeys/proxy.ts` Next.js
// middleware, which rewrites `/{path}` → `/{hostname}/{path}`; the query
// string survives the rewrite). The component and its getServerSideProps
// (journey-language translations via `?lang`, NES-1724) are shared via
// re-export.
export { default, getServerSideProps } from '../../home/legal/about-chat'
