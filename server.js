const app = require("./app");
const connectDB = require("./src/Config/db.js");
const logger = require("./src/Config/logger.js");

connectDB();

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
