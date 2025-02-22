const { z } = require("zod");
const User = require("../Model/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../Config/logger.js");
const sendEmailNotification = require("../Services/EmailService.js");
const {
  registerSchema,
  loginSchema,
} = require("../Validation/authValidation.js");

const register = async (req, res) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      logger.error("Registration failed: User already exists");
      return res.status(400).json({ message: "This Email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });

    await user.save();
    return res.status(201).json({ message: "User Signup Successfully!" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const groupedErrors = error.errors.reduce((acc, curr) => {
        const field = curr.path[0];
        acc[field] = curr.message;
        return acc;
      }, {});

      return res.status(400).json({
        message: "Validation failed!",
        errors: groupedErrors,
      });
    }
    logger.error("Signup failed:", error.message);
    console.log("error: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (!user) {
      logger.error("Login failed: User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.error("Login failed: Incorrect password");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const userData = {
      _id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
    };
    if (user) {
      sendEmailNotification(
        user.email,
        "Login Successfully!",
        "Thank you for signing up! We're glad to have you.",
        user.name
      );
    }
    return res
      .status(200)
      .json({ message: "Login Successfully", token, user: userData });
  } catch (error) {
    console.log("error: ", error);
    logger.error("Login failed:", error.message);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

const userData = async (req, res) => {
  try {
    const students = await User.find({ role: "Student" }).select("_id name");
    const teachers = await User.find({ role: "Teacher" }).select("_id name");
    return res.status(200).json({ student: students, teacher: teachers });
  } catch (error) {
    logger.error("Failed to Fetch!", error.message);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

module.exports = { login, register, userData };
