// A custom domain's `/` in the Page Language the proxy rewrote `?lang=` to:
// the plain route, bound with `language`. A domain with no campaign serves
// its journeys here on the first response, the tag ignored.
export { default, getStaticPaths, getStaticProps } from '../../index'
