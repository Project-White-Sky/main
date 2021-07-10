//Server Setup
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

//Other Server Configurations
const PORT = 8080;

//Other Dependencies
const path = require("path");

//Setting Up Postgres Pool
const { Pool } = require("pg");
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    database: "whitesky",
    password: "postgres",
    port: 5432
});

app.get("/", async function(req, res){
    var answer = await pool.query(`SELECT hello FROM "public"."ree" WHERE world='hello';`);
    res.send(answer.rows[0]);
})

app.use("/.well-known/pki-validation/", express.static(path.join(__dirname, '/sslcheck')));
server.listen(PORT, console.log(`Listening on port ${PORT}.`));