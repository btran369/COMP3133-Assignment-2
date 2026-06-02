import { User } from "../models/User.js";
import { Employee } from "../models/Employee.js";

const TEST_USER = {
  username: "admin",
  email: "admin@test.com",
  password: "test123"
};

const SAMPLE_EMPLOYEES = [
  {
    first_name: "Jane",
    last_name: "Doe",
    email: "jane.doe@company.com",
    gender: "Female",
    designation: "Senior Software Engineer",
    salary: 95000,
    date_of_joining: new Date("2022-03-15"),
    department: "Engineering",
    employee_photo: ""
  },
  {
    first_name: "Marcus",
    last_name: "Chen",
    email: "marcus.chen@company.com",
    gender: "Male",
    designation: "Designer",
    salary: 82000,
    date_of_joining: new Date("2023-01-10"),
    department: "Design",
    employee_photo: ""
  },
  {
    first_name: "Priya",
    last_name: "Sharma",
    email: "priya.sharma@company.com",
    gender: "Female",
    designation: "Manager",
    salary: 105000,
    date_of_joining: new Date("2021-07-20"),
    department: "Marketing",
    employee_photo: ""
  },
  {
    first_name: "Alex",
    last_name: "Rivera",
    email: "alex.rivera@company.com",
    gender: "Other",
    designation: "Analyst",
    salary: 72000,
    date_of_joining: new Date("2023-06-01"),
    department: "Finance",
    employee_photo: ""
  },
  {
    first_name: "David",
    last_name: "Kim",
    email: "david.kim@company.com",
    gender: "Male",
    designation: "Software Engineer",
    salary: 88000,
    date_of_joining: new Date("2022-11-05"),
    department: "Engineering",
    employee_photo: ""
  }
];

export async function seedDatabase() {
  try {
    // ─── Seed test user ────────────────────────────────
    const existingUser = await User.findOne({ username: TEST_USER.username });
    if (!existingUser) {
      await User.create(TEST_USER);
      console.log(`[Seed] Test user created — username: "${TEST_USER.username}", password: "${TEST_USER.password}"`);
    } else {
      console.log(`[Seed] Test user already exists — username: "${TEST_USER.username}", password: "${TEST_USER.password}"`);
    }

    // ─── Seed sample employees ─────────────────────────
    const employeeCount = await Employee.countDocuments();
    if (employeeCount === 0) {
      await Employee.insertMany(SAMPLE_EMPLOYEES);
      console.log(`[Seed] ${SAMPLE_EMPLOYEES.length} sample employees created`);
    } else {
      console.log(`[Seed] ${employeeCount} employees already exist, skipping seed`);
    }
  } catch (err) {
    console.error("[Seed] Error:", err.message);
  }
}
