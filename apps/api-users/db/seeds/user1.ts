import { aql, Database } from 'arangojs'

const db = new Database({ url: process.env.DATABASE_URL })

export async function user1(): Promise<void> {
  await db.query(aql`
  FOR journey in userJourneys
      FILTER journey.userId == "1"      
      REMOVE journey IN userJourneys`)

  await db.query(aql`
    FOR user in users
      FILTER user.email == 'yo@fake.com'
      REMOVE user IN users`)

  const user = await db.collection('users').save({
    _key: "1",
    firstName: 'yo',
    lastName: 'Fake',
    email: 'yo@fake.com',
    imageUrl:
      'https://images.unsplash.com/photo-1633114127408-af671c774b39?ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2340&q=80'
  })

  await db.collection('userJourneys').save({
    userId: user._key,
    journeyId: "1", // pulled from nua1 in api-journeys seed
    role: 'inviteRequested'
  })
}
