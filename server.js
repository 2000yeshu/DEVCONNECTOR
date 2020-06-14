const express = require("express");
const connectDB = require("./config/db");
const app = express();
var bodyParser = require("body-parser");

//connect db
connectDB();

app.get("/", (_, response) => response.send("API running"));
app.use(bodyParser.json());

//routes
app.use("/api/users", require("./routes/api/user"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));