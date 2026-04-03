const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

let incidents = [];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/incidents", (req, res) => {
  res.json(incidents);
});

app.post("/incident", (req, res) => {
  incidents.push(req.body);
  res.json({ message: "Saved successfully" });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
