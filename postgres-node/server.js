// Import env config, [Contains JWT secret key]
require("dotenv").config();

// Import express
const express = require("express");

// Import postgreSQL client
const { Pool } = require("pg");
const { resourceUsage, nextTick } = require("process");
const pool = new Pool({
  connectionString: "postgresql://postgres:emailer1234@localhost:5432/emailer",
});

// Password hashing+salting
const bcrypt = require("bcrypt");

// Handling JSON
const { json } = require("express");

// Create an instance of express (Start the server)
const app = express();
app.use(express.json()); // Enables to accept JSON requests.
app.use(express.static("./frontEnd"));

// JWT integration
const jwt = require("jsonwebtoken");

// Start listening to PORT 3000.
const PORT = 3000;
app.listen(PORT);
console.log(`running on http://localhost:${PORT}`);

init();

async function init() {
  // ******************************************* GETS DATA FROM postgreSQL DB **************************************************
  async function GET_psql(query) {
    try {
      const client = await pool.connect();
      const [result] = await Promise.all([client.query(`${query}`)]);
      return result.rows;
    } catch (err) {
      console.log("Error ********* Fetching from postgreSQL");
      console.log(err);
    }
  }

  // ******************************************** POSTS DATA INTO postgreSQL DB **************************************************
  async function POST_psql(query) {
    try {
      const client = await pool.connect();
      await Promise.all([client.query(`${query}`)]);
    } catch (err) {
      console.log(`Error ********* Failed posting into postgreSQL`);
      console.log(err);
    }
  }

  //   *************************************SERVES REGISTRATION FUNCTIONALITY.*****************************************************************

  app.post("/user/register", async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      POST_psql(`INSERT INTO users (username, loginpassword, fullname, phoneno, usertype) 
        VALUES ('${req.body.username}', '${hashedPassword}', '${req.body.fullname}', '${req.body.phoneno}', ${req.body.usertype});`);
      res.status(201).send();
    } catch {
      res.status(500).send();
    }
  });

  //   *************************************SERVES LOGIN FUNCTIONALITY.*****************************************************************

  app.post("/user/login", async (req, res) => {
    //Look for username in database, if found fetch password and user_id.
    let user = await GET_psql(
      `SELECT user_id, loginPassword, userType FROM users WHERE username='${req.body.username}'`
    );
    user = user[0];

    if (user === null) {
      return res.status(400).send("User not registered!!");
    }

    try {
      if (await bcrypt.compare(req.body.password, user.loginpassword)) {
        const userTokenRaw = {
          // Payload configuration.
          userId: user.user_id,
          userType: user.usertype,
        };
        const JWtoken = jwt.sign(userTokenRaw, process.env.ACCESS_TOKEN_SECRET);

        // res.send("Success!, Creating Token...");
        res.json({ accessToken: JWtoken }).end("Token Created Successfully!");
      } else {
        res.send("Access Denied, wrong password ^_^ ");
      }
    } finally {
      res.status(500).send();
    }
  });

  //******************************* SERVICES WITH AUTHENTICITY CHECK******************* */

  app.get(
    "/recent-emails",
    (req, res, next) => {
      //Middle-Ware Authentication.
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token === null) {
        res.sendStatus(401).end();
      }

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userInfo) => {
        if (err) return res.sendStatus(403);
        req.user = userInfo;
        next(); //Route if authorized.
      });
    },
    async (req, res) => {
      let recentEmails;
      if (req.user.userType) {
        recentEmails = await GET_psql(`SELECT email_id AS EMAIL_LIST, users.username AS LAST_USED_BY, 
        LEFT(to_char(timesent, 'HH12:MI:SS'), 19) 
        AS TIME_SENT FROM emailinfo NATURAL INNER JOIN users ORDER BY timesent;`);
      } else {
        recentEmails = await GET_psql(`SELECT email_id AS EMAIL_LIST, users.username AS LAST_USED_BY, 
        LEFT(to_char(timesent, 'HH12:MI:SS'), 19) AS TIME_SENT FROM 
        emailinfo INNER JOIN users ON users.user_id = emailinfo.user_id AND users.user_id=${req.user.userId};`);
      }
      res
        .json({
          authorizedUserId: req.user.userId,
          isAdmin: req.user.userType,
          recentEmails: recentEmails,
        })
        .end();
    }
  );

  //   ************************************ Testbench-1.*****************************************************************
  app.get("/get", async (req, res) => {
    let result = await GET_psql(`SELECT email_id FROM emailstored`);
    let recentEmailInfo = [];
    result.forEach(async (emailObj) => {
      recentEmailInfo.push(
        await GET_psql(
          `SELECT emailno, username, email_id FROM users INNER JOIN emailinfo ON users.user_id=emailinfo.user_id WHERE email_id='${emailObj.email_id}' ORDER BY timesent DESC LIMIT 1;`
        )
      );
    });

    console.log(recentEmailInfo);
    res
      .json({
        reslut: recentEmailInfo,
      })
      .end();
  });
  // *************************************** Testbench-2.******************************************************************
  app.get("/get/isAdmin", async (req, res) => {
    const queryFor = req.query.search;
    const result = await GET_psql(
      `SELECT usertype FROM users WHERE username='${queryFor}' OR fullname='${queryFor}';`
    );
    res
      .json({
        isAdmin: result[0].usertype || {},
      })
      .end();
  });
}
