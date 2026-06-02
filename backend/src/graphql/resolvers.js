import { User } from "../models/User.js";
import { Employee } from "../models/Employee.js";
import { badRequest, notFound } from "../utils/errors.js";
import { signToken, requireAuth } from "./auth.js";

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str || "").trim());
}

function normalizeGender(g) {
  const v = String(g || "").trim();
  if (["Male", "Female", "Other"].includes(v)) return v;
  return null;
}

export const resolvers = {
  Query: {
    async Login(_, { input }) {
      const usernameOrEmail = String(input.usernameOrEmail || "").trim();
      const password = String(input.password || "");

      if (!usernameOrEmail || !password)
        throw badRequest("Username/Email and password are required");

      const user = await User.findOne(
        isEmail(usernameOrEmail)
          ? { email: usernameOrEmail.toLowerCase() }
          : { username: usernameOrEmail }
      );

      if (!user) {
        return { success: "false", message: "Invalid credentials", token: null, user: null };
      }

      const ok = await user.comparePassword(password);
      if (!ok) {
        return { success: "false", message: "Invalid credentials", token: null, user: null };
      }

      const token = signToken(user);
      return { success: "true", message: "Login successful", token, user };
    },

    async GetAllEmployees(_, __, context) {
      requireAuth(context);
      return Employee.find().sort({ created_at: -1 });
    },

    async SearchEmployeeByEid(_, { eid }, context) {
      requireAuth(context);
      const emp = await Employee.findById(eid);
      if (!emp) throw notFound("Employee not found");
      return emp;
    },

    async SearchEmployeeByDesignationOrDepartment(_, { designation, department }, context) {
      requireAuth(context);

      const filter = {};
      if (designation) filter.designation = { $regex: String(designation).trim(), $options: "i" };
      if (department) filter.department = { $regex: String(department).trim(), $options: "i" };

      if (!designation && !department) {
        throw badRequest("Provide designation or department");
      }

      return Employee.find(filter).sort({ created_at: -1 });
    }
  },

  Mutation: {
    async Signup(_, { input }) {
      const username = String(input.username || "").trim();
      const email = String(input.email || "").trim().toLowerCase();
      const password = String(input.password || "");

      if (username.length < 3)
        throw badRequest("Username must be at least 3 characters");
      if (!isEmail(email)) throw badRequest("Invalid email");
      if (password.length < 6)
        throw badRequest("Password must be at least 6 characters");

      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { success: "true", message: "Signup successful", token, user };
      } catch (e) {
        if (e?.code === 11000) {
          const field = Object.keys(e.keyPattern || {})[0] || "field";
          throw badRequest(`Duplicate ${field}`);
        }
        throw e;
      }
    },

    async AddEmployee(_, { input }, context) {
      requireAuth(context);

      const gender = normalizeGender(input.gender);
      if (!gender) throw badRequest("Gender must be Male, Female, or Other");
      if (!isEmail(input.email)) throw badRequest("Invalid employee email");
      if (Number(input.salary) < 1000) throw badRequest("Salary must be >= 1000");

      try {
        const emp = await Employee.create({
          first_name: input.first_name,
          last_name: input.last_name,
          email: String(input.email).toLowerCase(),
          gender,
          designation: input.designation,
          salary: input.salary,
          date_of_joining: new Date(input.date_of_joining),
          department: input.department,
          employee_photo: input.employee_photo || ""
        });

        return { success: "true", message: "Employee created", employee: emp };
      } catch (e) {
        if (e?.code === 11000) throw badRequest("Duplicate employee email");
        if (e?.name === "ValidationError")
          throw badRequest("Validation failed", e.errors);
        throw e;
      }
    },

    async UpdateEmployeeByEid(_, { eid, input }, context) {
      requireAuth(context);

      const update = {};

      if (input.first_name != null) update.first_name = input.first_name;
      if (input.last_name != null) update.last_name = input.last_name;

      if (input.email != null) {
        if (!isEmail(input.email)) throw badRequest("Invalid employee email");
        update.email = String(input.email).trim().toLowerCase();
      }

      if (input.gender != null) {
        const g = normalizeGender(input.gender);
        if (!g) throw badRequest("Gender must be Male, Female, or Other");
        update.gender = g;
      }

      if (input.designation != null) update.designation = input.designation;
      if (input.department != null) update.department = input.department;

      if (input.salary != null) {
        if (Number(input.salary) < 1000)
          throw badRequest("Salary must be >= 1000");
        update.salary = input.salary;
      }

      if (input.date_of_joining != null) {
        update.date_of_joining = new Date(input.date_of_joining);
      }

      if (input.employee_photo != null) {
        update.employee_photo = input.employee_photo;
      }

      try {
        const emp = await Employee.findByIdAndUpdate(eid, update, {
          new: true,
          runValidators: true
        });
        if (!emp) throw notFound("Employee not found");
        return { success: "true", message: "Employee updated", employee: emp };
      } catch (e) {
        if (e?.code === 11000) throw badRequest("Duplicate employee email");
        if (e?.name === "ValidationError")
          throw badRequest("Validation failed", e.errors);
        throw e;
      }
    },

    async DeleteEmployeeByEid(_, { eid }, context) {
      requireAuth(context);

      const emp = await Employee.findByIdAndDelete(eid);
      if (!emp) throw notFound("Employee not found");
      return { success: "true", message: "Employee deleted" };
    }
  }
};
