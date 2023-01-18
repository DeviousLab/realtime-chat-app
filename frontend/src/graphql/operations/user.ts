import { gql } from "@apollo/client";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  Queries: {
    searchUsers: gql`
      query SearchUsers($username: String!) {
        searchUsers(username: $username) {
          id
          username
        }
      }
    `
  },
  Mutations: {
    createUser: gql`
      mutation CreateUser($username: String!) {
        createUser(username: $username) {
          success
          error
        }
      }
      `
  },
  Subscriptions: {},
}