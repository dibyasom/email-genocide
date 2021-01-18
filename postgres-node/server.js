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

  //   *************************************SERVES PHONE NO.*****************************************************************
  app.get("/get", async (req, res) => {
    const client = await pool.connect();
    const [result] = await Promise.all([
      client.query(
        `SELECT phoneno FROM users WHERE user_id=${req.query.search};`
      ),
    ]);

    res
      .json({
        phoneno: result.rows[0].phoneno || {},
      })
      .end();
  });
  // **************************************SERVES ADMIN VERIFICATION*******************************************************************
  app.get("/post", async (req, res) => {
    const client = await pool.connect();
    const queryFor = req.query.search;
    const [result] = await Promise.all([
      client.query(
        `SELECT usertype FROM users WHERE username='${queryFor}' OR fullname='${queryFor}';`
      ),
    ]);

    console.log(result.rows[0].usertype);
    res
      .json({
        isAdmin: result.rows[0].usertype || {},
      })
      .end();
  });
  // *********************************************************************************************************

  const PORT = 3000;
  app.use(express.static("./frontEnd"));
  app.listen(PORT);

  console.log(`running on http://localhost:${PORT}`);
}
init();
