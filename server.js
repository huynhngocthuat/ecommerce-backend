const app = require("./src/app");

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});

// process.on("SIGIN", () => {
//   server.close(() => console.log("Exit Server Express"));
// });
