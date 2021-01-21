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

const users = [];

init();

async function init() {
  //   *************************************SERVES LOGIN FUNCTIONALITY.*****************************************************************

  app.post("/user/register", async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = { username: req.body.username, password: hashedPassword };
      users.push(user);
      res.status(201).send();
    } finally {
      res.status(500).send();
    }
  });

  //   *************************************SERVES AUTHENTICATION.*****************************************************************

  // See Registered Users.
  app.get("/user/register", (req, res) => {
    res.json(users).end();
  });

  //   *************************************SERVES LOGIN FUNCTIONALITY.*****************************************************************

  app.post("/user/login", async (req, res) => {
    const user = users.find((user) => user.username === req.body.username);
    if (user === null) {
      return res.status(400).send("Cannot find user!!");
    }
    try {
      if (await bcrypt.compare(req.body.password, user.password)) {
        const userTokenRaw = { username: user.username }; // COnfigure payload.
        const JWtoken = jwt.sign(userTokenRaw, process.env.ACCESS_TOKEN_SECRET);

        // res.send("Success!, Creating Token...");
        res.json({ accessToken: JWtoken }).end("Token Created Successfully!");
      } else {
        res.send("Access Denied!!");
      }
    } finally {
      res.status(500).send();
    }
  });

  //************* */

  app.get(
    "/compliment",
    (req, res, next) => {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token === null) res.send("Token Missing, access denied").end();

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

  //   *************************************SERVES EMAIL DETAILS.*****************************************************************
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
}
