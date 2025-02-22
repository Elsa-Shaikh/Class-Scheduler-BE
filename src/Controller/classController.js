const Class = require("../Model/classModel.js");
const logger = require("../Config/logger.js");
const { classSchema } = require("../Validation/classValidation.js");
const { z } = require("zod");
const moment = require("moment");
const User = require("../Model/userModel.js");
const Notification = require("../Model/notificationModel.js");
const updateDuration = require("../Utils/helper.js");

const createClass = async (req, res) => {
  try {
    const validatedData = classSchema.parse(req.body);
    const {
      subject,
      teacher,
      room,
      startDate,
      endDate,
      startTime,
      endTime,
      classType,
      studentIDs,
    } = validatedData;
    const findteacher = await User.findById(teacher);
    if (!findteacher) {
      return res.status(404).json({ message: "User not Found!" });
    }
    const students = await User.find({ _id: { $in: studentIDs } });

    if (students.length !== studentIDs.length) {
      return res.status(404).json({
        message: "User not Found!",
      });
    }

    const formattedStartDate = moment(startDate, "MM-DD-YYYY").format(
      "YYYY-MM-DD"
    );
    const formattedEndDate = moment(endDate, "MM-DD-YYYY").format("YYYY-MM-DD");

    const conflictingClass = await Class.findOne({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      $or: [
        {
          startTime: { $lt: endTime, $gte: startTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $gte: startTime, $lt: endTime },
          endTime: { $gte: startTime },
        },
      ],
    });

    if (conflictingClass) {
      return res.status(400).json({
        message: "For this date and time there is already scheduled a class!",
      });
    }

    const durationInMinutes = moment(endTime, "HH:mm").diff(
      moment(startTime, "HH:mm"),
      "minutes"
    );
    const duration = (durationInMinutes / 60).toFixed(1) + " Hour";

    const newClass = new Class({
      subject,
      teacher,
      room,
      duration,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      startTime,
      endTime,
      classType,
      studentIDs,
    });

    await newClass.save();

    for (const studentID of studentIDs) {
      await Notification.create({
        user: studentID,
        message: `Your ${subject} class has been scheduled from ${startTime} to ${endTime} in ${room}.`,
      });
    }

    await Notification.create({
      user: teacher,
      message: `Your ${subject} class will be scheduled from ${startTime} to ${endTime} in ${room}. Duration: ${duration}`,
    });

    return res.status(201).json({ message: "Class Added Successfully!" });
  } catch (error) {
    console.log("error: ", error);
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
    logger.error("Class creation failed", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const editClass = async (req, res) => {
  try {
    const { teacher, room, startDate, endDate, startTime, endTime, classType } =
      req.body;
    let formattedStartDate, formattedEndDate;
    const findClass = await Class.findById(req.params.id);
    if (!findClass) {
      return res.status(404).json({ message: "Class not found" });
    }
    if (startDate || endDate || startTime || endTime) {
      const [startDay, startMonth, startYear] = startDate.split("-");
      const [endDay, endMonth, endYear] = endDate.split("-");

      formattedStartDate = new Date(
        `${startYear}-${startMonth}-${startDay}T00:00:00Z`
      );
      formattedEndDate = new Date(`${endYear}-${endMonth}-${endDay}T00:00:00Z`);
      const conflictingClass = await Class.findOne({
        _id: { $ne: req.params.id },
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        startTime,
        endTime,
      });
      if (conflictingClass) {
        return res.status(400).json({
          message: "For this date and time there is already scheduled a class",
        });
      }
    }
    let previousTeacher = null;
    if (teacher) {
      const findTeacher = await User.findById(teacher);
      if (!findTeacher) {
        return res.status(404).json({ message: "Teacher not found!" });
      }
      previousTeacher = findClass.teacher;
      findClass.teacher = teacher;
    }

    if (room) findClass.room = room;
    if (startDate) findClass.startDate = formattedStartDate;
    if (endDate) findClass.endDate = formattedEndDate;
    if (startTime) findClass.startTime = startTime;
    if (endTime) findClass.endTime = endTime;
    if (startTime || endTime) {
      const duration = updateDuration(
        startTime,
        endTime,
        findClass?.startTime,
        findClass?.endTime
      );

      if (duration) {
        findClass.duration = duration;
      }
    }
    if (classType) findClass.classType = classType;
    await findClass.save();
    const notifications = [];

    if (teacher) {
      notifications.push(
        Notification.create({
          user: teacher,
          message: `You have been assigned to the class for ${findClass.subject}.`,
        })
      );

      if (
        previousTeacher &&
        previousTeacher.toString() !== teacher.toString()
      ) {
        notifications.push(
          Notification.create({
            user: previousTeacher,
            message: `Your scheduled class will be conducted by teacher: ${findTeacher?.name}`,
          })
        );
      }

      for (const studentID of findClass?.studentIDs) {
        notifications.push(
          Notification.create({
            user: studentID,
            message: `Subject: ${findClass.subject} will be conducted by teacher: ${findTeacher?.name}.`,
          })
        );
      }
    }

    if (room || startDate || startTime || endTime || classType) {
      const studentNotifications = findClass.studentIDs.map((studentID) =>
        Notification.create({
          user: studentID,
          message: `The class schedule has been updated for the subject: ${findClass.subject}. Please view your updated schedule.`,
        })
      );

      notifications.push(
        Notification.create({
          user: findClass.teacher,
          message: `The schedule for the subject: ${findClass.subject} has been changed. Please review the updates.`,
        })
      );

      notifications.push(...studentNotifications);
    }

    await Promise.all(notifications);

    return res.status(200).json({ message: "Class Edit Successfully!" });
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteClass = async (req, res) => {
  try {
    const removedClass = await Class.findByIdAndDelete(req.params.id);
    if (!removedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const { subject, teacher, startTime, endTime, studentIDs } = removedClass;

    await Notification.create({
      user: teacher,
      message: `The class for subject ${subject} from ${startTime} to ${endTime} has been cancelled.`,
    });

    for (const studentID of studentIDs) {
      await Notification.create({
        user: studentID,
        message: `The class for subject ${subject} from ${startTime} to ${endTime} has been cancelled.`,
      });
    }

    return res.json({ message: "Class Cancelled Successfully!" });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("teacher", "_id name email role")
      .populate("studentIDs", "_id name email role");
    const totalCount = await Class.countDocuments();

    return res.json({ totalCount, data: classes });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const { room, classType } = req.query;

    const filter = { teacher: teacherId };
    if (room) {
      filter.room = { $regex: new RegExp(room, "i") };
    }
    if (classType) {
      filter.classType = { $regex: new RegExp(classType, "i") };
    }
    const classes = await Class.find(filter).populate(
      "teacher",
      "_id name email role"
    );
    const totalCount = await Class.countDocuments(filter);

    return res.json({ totalCount, data: classes });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getStudentClasses = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { room, subject, classType } = req.query;

    const filter = { studentIDs: { $in: [studentId] } };
    if (room) {
      filter.room = { $regex: new RegExp(room, "i") };
    }
    if (subject) {
      filter.subject = { $regex: new RegExp(subject, "i") };
    }
    if (classType) {
      filter.classType = { $regex: new RegExp(classType, "i") };
    }
    const classes = await Class.find(filter).populate(
      "teacher",
      "_id name email role"
    );

    const totalCount = await Class.countDocuments(filter);

    return res.json({ totalCount, data: classes });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createClass,
  getClasses,
  editClass,
  deleteClass,
  getTeacherClasses,
  getStudentClasses,
};
