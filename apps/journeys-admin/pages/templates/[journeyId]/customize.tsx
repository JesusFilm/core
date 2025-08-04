import { GetServerSideProps } from 'next'

function CustomizePage({ journeyId }) {
  return <div>{'Hello World'}</div>
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  return {
    props: {
      journeyId: params?.journeyId
    }
  }
}
