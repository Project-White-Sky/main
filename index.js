const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const PORT = 8080;
app.get("/", function(req, res) {
    res.send("hello world");
})
server.listen(PORT, console.log(`Listening on port ${PORT}.`))