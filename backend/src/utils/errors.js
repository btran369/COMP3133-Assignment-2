import { GraphQLError } from "graphql";

export function badRequest(message, details = null) {
  return new GraphQLError(message, {
    extensions: { code: "BAD_REQUEST", details }
  });
}

export function unauthorized(message = "Unauthorized") {
  return new GraphQLError(message, {
    extensions: { code: "UNAUTHORIZED" }
  });
}

export function notFound(message = "Not found") {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" }
  });
}