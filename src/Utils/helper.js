const moment = require("moment");

const updateDuration = (
  startTime,
  endTime,
  existingStartTime,
  existingEndTime
) => {
  if (startTime && endTime) {
    const durationInMinutes = moment(endTime, "HH:mm").diff(
      moment(startTime, "HH:mm"),
      "minutes"
    );
    return (durationInMinutes / 60).toFixed(1) + " Hour";
  } else if (startTime && !endTime) {
    const durationInMinutes = moment(existingEndTime, "HH:mm").diff(
      moment(startTime, "HH:mm"),
      "minutes"
    );
    return (durationInMinutes / 60).toFixed(1) + " Hour";
  } else if (!startTime && endTime) {
    const durationInMinutes = moment(endTime, "HH:mm").diff(
      moment(existingStartTime, "HH:mm"),
      "minutes"
    );
    return (durationInMinutes / 60).toFixed(1) + " Hour";
  }
  return null;
};

module.exports = updateDuration;
