const express = require("express");
const {
  createClass,
  getClasses,
  editClass,
  deleteClass,
  getTeacherClasses,
  getStudentClasses,
} = require("../Controller/classController.js");
const authMiddleware = require("../Middleware/authMiddleware.js");
const roleMiddleware = require("../Middleware/roleBasedMiddleware.js");

const router = express.Router();

// Admin routes
router.post("/create", authMiddleware, roleMiddleware(["Admin"]), createClass);
router.get("/read", authMiddleware, roleMiddleware(["Admin"]), getClasses);
router.put("/edit/:id", authMiddleware, roleMiddleware(["Admin"]), editClass);
router.delete("/delete/:id", authMiddleware, roleMiddleware(["Admin"]), deleteClass);
// teacher route
router.get("/get/:id", authMiddleware, roleMiddleware(["Teacher"]), getTeacherClasses);
// student route
router.get("/read/:id", authMiddleware, roleMiddleware(["Student"]), getStudentClasses);

module.exports = router;
