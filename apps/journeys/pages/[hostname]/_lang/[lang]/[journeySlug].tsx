// A custom domain's `/<segment>` in the Page Language the proxy rewrote
// `?lang=` to: the plain route, bound with `language`. A segment that is no
// region renders its journey here on the first response, the tag ignored.
export { default, getStaticPaths, getStaticProps } from '../../[journeySlug]'
