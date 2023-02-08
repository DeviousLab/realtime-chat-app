import gql from "graphql-tag";
const typeDefs = gql `
  type SearchedUser {
    id: String
    username: String
  }

  type User {
    id: String
    name: String
    username: String
    email: String
    emailVerified: Boolean
    image: String
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
`;
export default typeDefs;
