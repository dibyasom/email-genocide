const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "",
});
