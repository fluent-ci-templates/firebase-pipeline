import { gql } from "../../deps.ts";

export const deploy = gql`
  query Deploy($src: String!, $directory: String!, $token: String!) {
    deploy(src: $src, directory: $directory, token: $token)
  }
`;
