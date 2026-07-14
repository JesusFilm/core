# Watch Modern

An early-stage successor shell for the `jesusfilm.org/watch` surface, mounted at `/watch` behind proxy routing so it can coexist with the legacy Watch app. Today it is a scaffold — a landing page, a routing demo, locale handling, and observability — with no video catalog implemented. Owns no entities; when the video vocabulary lands here it will be the media and languages contexts' (Video, Variant, Language), as on the sibling surfaces.

## Language

**Modern Proxy Routing**:
The deployment scheme that lets this app serve `/watch` alongside the legacy Watch app: the app is mounted at the `/watch` base path with its static assets namespaced under `/watch/modern` so the two apps' traffic can be split at the proxy without colliding.
_Avoid_: basePath/assetPrefix (config details — name the scheme)

**Legacy Watch Redirect**:
The compatibility shim that forwards an old CGI-style `/bin/jf/watch.html/{videoId}/{languageId}` URL (numeric ids) onward for resolution. Same term as in the Resources context; the two definitions must stay aligned.

**Locale**:
The UI language of the site chrome, chosen from a fixed list of twelve, resolved from the device's locale cookie first and the browser's `Accept-Language` otherwise. Distinct from any playback language — the Audio Language / Subtitle Preference concepts from the sibling Watch surfaces do not exist here yet.
_Avoid_: Language (ambiguous with the languages-context entity)

### Terminology traps

**Three Watch surfaces**:
"Watch" names three apps: `apps/watch` (the legacy production surface), `apps/resources` (a full next-generation rebuild of the same product), and this app (a separate, thinner successor shell built around Modern Proxy Routing — not a fork of either). Always say which app you mean; "modern" alone is ambiguous between this app and the unrelated `ui-modern` libs.
