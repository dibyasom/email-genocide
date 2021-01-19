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
        `SELECT fullName, email_id, phoneno, timesent, contentfile, emailstatus 
        FROM users NATURAL INNER JOIN emailinfo NATURAL INNER JOIN emailStored
        WHERE user_id=${req.query.search};`
      ),
    ]);

    res
      .json({
        result: result.rows || {},
      })
      .end();
  });
  // **************************************SERVES ADMIN VERIFICATION*******************************************************************
  app.get("/get/isAdmin", async (req, res) => {
    const client = await pool.connect();
    const queryFor = req.query.search;
    console.log(
      `SELECT usertype FROM users WHERE username='${queryFor}' OR fullname='${queryFor}'`
    );
    const [userType] = await Promise.all([
      client.query(
        `SELECT usertype FROM users WHERE username='${queryFor}' OR fullname='${queryFor}';`
      ),
    ]);
    console.log(userType.rows[0]);
    res
      .json({
        isAdmin: userType.rows[0] || {},
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
