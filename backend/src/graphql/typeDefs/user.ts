import { gql } from "apollo-server-core";

const typeDefs = gql`
  type SearchedUser {
    id: String
    username: String
  }

  type Query {
    searchUsers(username: String): [SearchedUser]
  }

  type CreateUserResponse {
    success: Boolean
    error: String
  }

  type Mutation {
    createUser(username: String): CreateUserResponse
  }
`

export default typeDefs;