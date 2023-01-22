import { gql } from 'apollo-server-core';

const typeDefs = gql`
  scalar Date

  type Message {
    id: String
    user: User
    content: String
    createdAt: Date
  }
`

export default typeDefs;