const express = require("express");
const converter = require("./converter");
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.post("/html_converter", [body("html").exists()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { html } = req.body;
  const data = converter(html);
  res.json({ data });
});

module.exports = app;
