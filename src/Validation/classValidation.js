const { z } = require("zod");

// const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;
const timeRegex = /^(0[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$/;

const classSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  teacher: z.string().min(1, "Teacher is required"),
  room: z.string().min(1, "Room is required"),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().refine((val) => timeRegex.test(val), {
    message: "Invalid start time format. Expected HH:MM AM/PM.",
  }),
  endTime: z.string().refine((val) => timeRegex.test(val), {
    message: "Invalid end time format. Expected HH:MM AM/PM.",
  }),
  classType: z.enum(["In Class", "Online", "In Drive"]),
  studentIDs: z.array(z.string()).min(1, "At least one student is required"),
});

module.exports = {
  classSchema,
};
