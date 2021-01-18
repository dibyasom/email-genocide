const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const { resourceUsage } = require("process");

const pool = new Pool({
  connectionString:
    "postgresql://postgres:mysecretpassword@localhost:5432/emailer",
});

async function init() {
  const app = express();

  app.get("/get", async (req, res) => {
    const client = await pool.connect();
    const [result] = await Promise.all([
      client.query(
        `SELECT phoneno FROM users WHERE user_id=${req.query.search};`
      ),
    ]);

    console.log(result.rows[0].phoneno);
    res
      .json({
        phoneno: result.rows[0].phoneno || {},
      })
      .end();
  });

  app.get("/post", async (req, res) => {
    console.log(`fullname=${req.query.search}`);
    res.end();
    // const client = await pool.connect();
    // const [result] = await Promise.all([
    //   client.query(
    //     `SELECT phoneno FROM users WHERE user_id=${req.query.search};`
    //   ),
    // ]);

    // console.log(result.rows[0].phoneno);
    // res
    //   .json({
    //     phoneno: result.rows[0].phoneno || {},
    //   })
    //   .end();
  });
  const PORT = 3000;
  app.use(express.static("./frontEnd"));
  app.listen(PORT);

  console.log(`running on http://localhost:${PORT}`);
}
init();
