import { gql } from "@apollo/client";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  Queries: {},
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