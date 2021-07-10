//Server Dependencies
const fs = require("fs");
const express = require("express");
const http/*s*/ = require(/*"https"*/"http");
const app = express();

//Server Configuration
/*
var privateKey  = fs.readFileSync('certs/private.key', 'utf8');
var certificate = fs.readFileSync('certs/certificate.crt', 'utf8');
var cacert = fs.readFileSync('certs/ca_bundle.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate, ca: cacert };
*/
const server = http/*s*/.createServer(/*credentials, */app);
const io = require("socket.io")(server);
const PORT = 8080;;

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

server.listen(PORT, console.log(`Listening on port ${PORT}.`));