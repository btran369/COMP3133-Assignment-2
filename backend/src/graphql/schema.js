import {
  GraphQLSchema, GraphQLObjectType, GraphQLString,
  GraphQLFloat, GraphQLID, GraphQLList,
  GraphQLNonNull, GraphQLInputObjectType
} from "graphql";
import { resolvers } from "./resolvers.js";

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    _id: { type: new GraphQLNonNull(GraphQLID) },
    username: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString }
  }
});

const EmployeeType = new GraphQLObjectType({
  name: "Employee",
  fields: {
    _id: { type: new GraphQLNonNull(GraphQLID) },
    first_name: { type: new GraphQLNonNull(GraphQLString) },
    last_name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    gender: { type: new GraphQLNonNull(GraphQLString) },
    designation: { type: new GraphQLNonNull(GraphQLString) },
    salary: { type: new GraphQLNonNull(GraphQLFloat) },
    date_of_joining: { type: new GraphQLNonNull(GraphQLString) },
    department: { type: new GraphQLNonNull(GraphQLString) },
    employee_photo: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString }
  }
});

const AuthPayloadType = new GraphQLObjectType({
  name: "AuthPayload",
  fields: {
    success: { type: new GraphQLNonNull(GraphQLString) },
    message: { type: new GraphQLNonNull(GraphQLString) },
    token: { type: GraphQLString },
    user: { type: UserType }
  }
});

const MutationResponseType = new GraphQLObjectType({
  name: "MutationResponse",
  fields: {
    success: { type: new GraphQLNonNull(GraphQLString) },
    message: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const EmployeeResponseType = new GraphQLObjectType({
  name: "EmployeeResponse",
  fields: {
    success: { type: new GraphQLNonNull(GraphQLString) },
    message: { type: new GraphQLNonNull(GraphQLString) },
    employee: { type: EmployeeType }
  }
});

// ─── Input types ─────────────────────────────────────

const SignupInput = new GraphQLInputObjectType({
  name: "SignupInput",
  fields: {
    username: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const LoginInput = new GraphQLInputObjectType({
  name: "LoginInput",
  fields: {
    usernameOrEmail: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  }
});

const EmployeeInput = new GraphQLInputObjectType({
  name: "EmployeeInput",
  fields: {
    first_name: { type: new GraphQLNonNull(GraphQLString) },
    last_name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    gender: { type: new GraphQLNonNull(GraphQLString) },
    designation: { type: new GraphQLNonNull(GraphQLString) },
    salary: { type: new GraphQLNonNull(GraphQLFloat) },
    date_of_joining: { type: new GraphQLNonNull(GraphQLString) },
    department: { type: new GraphQLNonNull(GraphQLString) },
    employee_photo: { type: GraphQLString }  // Cloudinary URL from /upload
  }
});

const UpdateEmployeeInput = new GraphQLInputObjectType({
  name: "UpdateEmployeeInput",
  fields: {
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    email: { type: GraphQLString },
    gender: { type: GraphQLString },
    designation: { type: GraphQLString },
    salary: { type: GraphQLFloat },
    date_of_joining: { type: GraphQLString },
    department: { type: GraphQLString },
    employee_photo: { type: GraphQLString }  // Cloudinary URL from /upload
  }
});

// ─── Query ───────────────────────────────────────────

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    Login: {
      type: AuthPayloadType,
      args: { input: { type: new GraphQLNonNull(LoginInput) } },
      resolve: resolvers.Query.Login
    },
    GetAllEmployees: {
      type: new GraphQLList(EmployeeType),
      resolve: resolvers.Query.GetAllEmployees
    },
    SearchEmployeeByEid: {
      type: EmployeeType,
      args: { eid: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: resolvers.Query.SearchEmployeeByEid
    },
    SearchEmployeeByDesignationOrDepartment: {
      type: new GraphQLList(EmployeeType),
      args: {
        designation: { type: GraphQLString },
        department: { type: GraphQLString }
      },
      resolve: resolvers.Query.SearchEmployeeByDesignationOrDepartment
    }
  }
});

// ─── Mutation ────────────────────────────────────────

const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    Signup: {
      type: AuthPayloadType,
      args: { input: { type: new GraphQLNonNull(SignupInput) } },
      resolve: resolvers.Mutation.Signup
    },
    AddEmployee: {
      type: EmployeeResponseType,
      args: {
        input: { type: new GraphQLNonNull(EmployeeInput) }
      },
      resolve: resolvers.Mutation.AddEmployee
    },
    UpdateEmployeeByEid: {
      type: EmployeeResponseType,
      args: {
        eid: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(UpdateEmployeeInput) }
      },
      resolve: resolvers.Mutation.UpdateEmployeeByEid
    },
    DeleteEmployeeByEid: {
      type: MutationResponseType,
      args: { eid: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: resolvers.Mutation.DeleteEmployeeByEid
    }
  }
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
});
