// Import env config, [Contains JWT secret key]
require("dotenv").config();

// Import express
const express = require("express");

// Import postgreSQL client
const { Pool } = require("pg");
const { resourceUsage, nextTick } = require("process");
const pool = new Pool({
  connectionString:
    "postgresql://postgres:mysecretpassword@localhost:5432/emailer",
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
    } finally {
      console.log("Error ********* Fetching from postgreSQL");
    }
  }

  // ******************************************** POSTS DATA INTO postgreSQL DB **************************************************
  async function POST_psql(query) {
    try {
      const client = await pool.connect();
      await Promise.all([client.query(`${query}`)]);
    } catch {
      console.log(`Error ********* Failed posting into postgreSQL`);
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
    "/compliment",
    (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token === null) {
        res.send("Token Missing, access denied").end();
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    },
    (req, res) => {
      res.json({ authorizedUser: req.user.username }).end();
    }
  );

  //   ************************************ Testbench-1.*****************************************************************
  app.get("/get", async (req, res) => {
    let result = await GET_psql(
      `SELECT email_id FROM users WHERE user_id='${req.query.search}'`
    );
    result = result[0];

    res
      .json({
        loginPassword: result.loginpassword || "",
        userType: result.usertype || "",
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
