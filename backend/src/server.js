import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { createHandler } from "graphql-http/lib/use/express";
import multer from "multer";
import { connectDb } from "./config/db.js";
import { seedDatabase } from "./config/seed.js";
import { schema } from "./graphql/schema.js";
import { getUserFromAuthHeader } from "./graphql/auth.js";
import { uploadImageBuffer } from "./config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

// ─── Lazy DB connection (works for both local & serverless) ──
let dbConnected = false;
async function ensureDb() {
  if (!dbConnected) {
    await connectDb(process.env.MONGO_URI);
    await seedDatabase();
    dbConnected = true;
  }
}

// Middleware: connect to DB before handling any request
app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ─── GraphQL endpoint ────────────────────────────────
const graphqlHandler = createHandler({
  schema,
  context: (req) => {
    const authHeader = req.headers.authorization || "";
    const authUser = getUserFromAuthHeader(authHeader);
    return { authUser, req };
  }
});

app.all("/graphql", graphqlHandler);
app.all("/api/graphql", graphqlHandler);

// ─── REST photo upload endpoint ──────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Only PNG and JPEG images are allowed"), false);
    }
  }
});

const uploadHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const authUser = getUserFromAuthHeader(authHeader);
    if (!authUser) {
      return res.status(401).json({ error: "Login required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result = await uploadImageBuffer({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype
    });
    res.json({ url: result.secure_url || result.url || "" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
};

app.post("/upload", upload.single("photo"), uploadHandler);
app.post("/api/upload", upload.single("photo"), uploadHandler);

// ─── Serve Angular frontend (local only) ─────────────
// On Vercel, the frontend is a separate service — no static serving needed
if (!process.env.VERCEL) {
  const frontendDist = path.resolve(__dirname, "../../frontend/dist/browser");
  app.use(express.static(frontendDist));

  app.get("*", (req, res) => {
    const indexPath = path.join(frontendDist, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send(
          "Employee Management GraphQL API is running. " +
          "Build the frontend with 'npm run build:frontend' to serve the Angular app."
        );
      }
    });
  });
}

// ─── Health check (works on Vercel too) ──────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Employee Management GraphQL API is running" });
});

// ─── Local dev: start listening ──────────────────────
const port = Number(process.env.PORT || 4000);

if (!process.env.VERCEL) {
  await ensureDb();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`GraphQL endpoint: http://localhost:${port}/graphql`);
  });
}

// ─── Export for Vercel serverless ─────────────────────
export default app;
