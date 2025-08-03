import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

// ===== Setup for __dirname (needed in ES Modules) =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Create app after all imports =====
const app = express();

// ===== Middleware setup =====
app.use(cors());
app.use(bodyParser.json());

// ===== Serve static files =====
app.use(express.static(path.join(__dirname, "public"))); // ← you had this too early

// ===== Mongoose DB connection =====
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://onjaeeb:test1234@cluster0.85qyvbw.mongodb.net/EnrollmentDB?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});
mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

connectDB();

// ===== Mongoose Schemas =====
const EnrollmentSchema = new mongoose.Schema({
  studentName: String,
  course: String,
  semester: String,
  enrollmentDate: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const RegistrationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  courseCode: String,
  courseName: String,
  credits: Number,
  instructor: String,
  status: String, // "Registered", "Waitlisted", etc.
  registeredAt: { type: Date, default: Date.now },
});

const CourseSchema = new mongoose.Schema({
  courseCode: String,
  courseName: String,
  credits: Number,
  instructor: String,
});

const User = mongoose.model("User", UserSchema);
const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);
const Registration = mongoose.model("Registration", RegistrationSchema);
const Course = mongoose.model("Course", CourseSchema);

app.post("/api/enrollments", async (req, res) => {
  try {
    const newEnrollment = new Enrollment(req.body);
    const savedEnrollment = await newEnrollment.save();
    res.status(201).json(savedEnrollment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/enrollments", async (req, res) => {
  try {
    const enrollments = await Enrollment.find().sort({ enrollmentDate: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    const savedUser = await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ error: "Invalid username or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid username or password" });

    // Success — in future, we can send a token or session info
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/registrations/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const registrations = await Registration.find({ studentId: user._id });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/dev/seed-registrations", async (req, res) => {
  const user = await User.findOne({ username: "osa203" });

  if (!user) {
    return res
      .status(404)
      .json({ error: "User 'osa203' not found. Please sign up first." });
  }

  const seedData = [
    {
      studentId: user._id,
      courseCode: "CS101",
      courseName: "Intro to Computer Science",
      credits: 3,
      instructor: "Dr. Alan Smith",
      status: "Registered",
    },
    {
      studentId: user._id,
      courseCode: "ENG103",
      courseName: "English Composition",
      credits: 2,
      instructor: "Dr. William King",
      status: "Waitlisted",
    },
  ];

  await Registration.insertMany(seedData);
  res.json({ message: "Seeded!" });
});

app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/dev/seed-courses", async (req, res) => {
  const seedCourses = [
    {
      courseCode: "CS201",
      courseName: "Advanced Computer",
      credits: 3,
      instructor: "Dr. Umbreen",
    },
    {
      courseCode: "MATH201",
      courseName: "Calculus III",
      credits: 4,
      instructor: "Prof. Jane Doe",
    },
    {
      courseCode: "ENGR104",
      courseName: "Advanced Physics",
      credits: 4,
      instructor: "Prof. Sam Jetstream",
    },
  ];

  await Course.insertMany(seedCourses);
  res.json({ message: "Courses seeded!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
