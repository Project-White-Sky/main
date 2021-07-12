//Server Dependencies
const fs = require("fs");
const express = require("express");
const http = require("http");
const app = express();
const cors = require('cors');
const helmet = require('helmet');

//Server Configuration
const server = http.createServer(app);
const io = require("socket.io")(server);
app.set('view engine', 'ejs');
app.use(cors());
app.use(helmet());
const PORT = 8080;

//Other Dependencies
const path = require("path");
const hash = require("object-hash");
const isodd = require("is-odd"); //lol

//Setting Up Postgres Pool
const { Pool } = require("pg");
const { SocketAddress } = require("net");
const { pathToFileURL } = require("url");
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    database: "whitesky",
    password: "postgres",
    port: 5432
});

//Exposing Static Assets to Internet
app.use('/static', express.static(path.join(__dirname, '/static')))

//Exposing EJS Sites to Internet
app.get("/", async function(req, res){
    res.render("pages/home");
})
app.get("/hub", async function(req, res){
    res.render("pages/hub");
})
app.get("/northpole", function(req, res){
    res.render("pages/northpole")
})
app.get("/shop", function (req, res) {
    res.render("pages/shop");
})

//Socket.io Code
io.on("connection", function(socket) {
    var id = socket.id;
    socket.on('getcoins',function(uuid,callback){
        pool.query(`SELECT skycoin FROM "public"."accounts" WHERE id=${uuid};`,function (err,result){
            callback(result.rows[0].skycoin);
        })
    })
    socket.on('addcoin', function(uuid,amount,callback){
        pool.query(`UPDATE "public"."accounts" SET skycoin = skycoin+${amount} WHERE id=${uuid} RETURNING skycoin`,function (err,result){
            callback(result.rows[0].skycoin);
        })
    })
    socket.on('signup', async function(username, password, email, callback){
        pool.query(`SELECT EXISTS(SELECT username FROM "public"."accounts" WHERE email='${email}' OR username='${replaceAll(username,"'","''")}');`, function(err, doesexist) {
            if (err) {
                console.error(err);
                return;
            }
            if(doesexist["rows"][0]["exists"]){
                callback([false,"Account with that Email or Username already exists."]);
            }else{
                var uuid = numlengen(14);
                var queryresult;
                pool.query(`SELECT EXISTS(SELECT username FROM "public"."accounts" WHERE id=${uuid});`, function (err, result) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    queryresult = result;
                    while(queryresult["rows"][0]["exists"]){
                        uuid = numlengen(14);
                        pool.query(`SELECT EXISTS(SELECT username FROM "public"."accounts" WHERE id=${uuid});`, function (err, result) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            queryresult = result;
                        });
                    }
                });
                pool.query(`INSERT INTO "public"."accounts" (username,password,datejoined,yourdinos,email,id,schedule, xp, skycoin, achievements) VALUES ('${username}','${hash(password)}',NOW(),ARRAY['{}'::json],'${email}',${uuid},ARRAY['{"time": "12:00-12:00","activity": "Your Subject/Project","goal": "Your Goal For The Session","done":false}'::json], 0, 0, '{"First Schedule": false, "Completed First Goal": false, "Customized Your Dino": false, "Buy Another Dino": false}'::json)`, function (err, result) {
                    if (err) {
                        console.error(err);
                    }
                });
                callback([true, uuid]);
            }
        })
    })
    socket.on('login', async function (umail, password, callback) {
        pool.query(`SELECT EXISTS(SELECT username FROM "public"."accounts" WHERE email='${replaceAll(umail,"'","''")}' OR username='${replaceAll(umail,"'","''")}');`, function (err, doesexist){
            if(doesexist["rows"][0]["exists"]){
                pool.query(`SELECT * FROM "public"."accounts" WHERE email='${replaceAll(umail,"'","''")}' OR username='${replaceAll(umail,"'","''")}';`, function (err, user) {
                    user = user["rows"]["0"];
                    if(user["password"] == hash(password)){
                        callback([true, user["id"]]);
                    } else {
                        callback([false, "Wrong Password"]);
                    };
                })
            }else{
                callback([false,"No Account with that Email or Username exists."]);
            }
        })
    })
    socket.on('userinfo', function (token, callback) {
        pool.query(`SELECT * FROM "public"."accounts" WHERE id = ${token};`, function (err, result) {
            if (err) {
                console.error(err);
                callback(false);
                return ;
            } else if(result.rows.length == 0){
                callback(false);
                return ;
            } else {
                callback(result["rows"][0]);
            }
        });
    });
    socket.on("savesche", function(uuid, list, callback) {
        if(list.length == 0){
            list[0] = {
                time: "12:00-12:00",
                activity: "Your Subject/Project",
                goal: "Your Goal For The Session",
                done: false
            }
        }
        var schedule = jsonarrpsql(list);
        pool.query(`UPDATE "public"."accounts" SET schedule=${schedule} WHERE id=${uuid};`, function(err, result) {
            if(err){
                return console.warn(err);
            }
            pool.query(`SELECT achievements FROM "public"."accounts" WHERE id = ${uuid};`, function (err, result) {
                if(err) {
                    return console.error(err)
                }
                if(!result["rows"][0]["achievements"]["First Schedule"]) {
                    var achievements = result["rows"][0]["achievements"];
                    achievements["First Schedule"] = true;
                    achievements = JSON.stringify(achievements);
                    pool.query(`UPDATE "public"."accounts" SET achievements='${achievements}' WHERE id=${uuid};`, function(err, result) {
                        if(err){
                            return console.warn(err);
                        }
                    })
                    callback([true, "Join WhiteSky","firstvisit.svg"]);
                    return ;
                }
                var completedagoal = false;
                for(i=0;i<list.length;i++){
                    if(completedagoal != true){
                        completedagoal = list[i].done
                    }
                }
                if(completedagoal && !result["rows"][0]["achievements"]["Completed First Goal"]) {
                    var achievements = result["rows"][0]["achievements"];
                    achievements["Completed First Goal"] = true;
                    achievements = JSON.stringify(achievements);
                    pool.query(`UPDATE "public"."accounts" SET achievements='${achievements}' WHERE id=${uuid};`, function(err, result) {
                        if(err){
                            return console.warn(err);
                        }
                    })
                    callback([true, "Complete Your First Goal","firstgoal.svg"]);
                    return ;
                }
                callback([false])
            });
        })
    })
    socket.on("setdino", function (uuid, dinos, callback) {
        pool.query(`SELECT yourdinos FROM "public"."accounts" WHERE id=${uuid}`,function (err,result){
            var result = result.rows[0].yourdinos
            if(typeof result[0].dino == "undefined"){
                dinos = [dinos]
            }else{
                result.push(dinos)
                dinos = result
            }
            pool.query(`UPDATE "public"."accounts" SET yourdinos = ${jsonarrpsql(dinos)} WHERE id = ${uuid};`, function (err, result) {
                if (err) {
                    console.error(err);
                    callback(false);
                    return;
                }
                callback(true);
            })
        });
    })
    socket.on('hasdino', function (uuid,callback){
        pool.query(`SELECT yourdinos FROM "public"."accounts" WHERE id=${uuid}`,function(result){
            callback(typeof result.rows[0].yourdinos[0].dino != undefined);
        })
    })
    socket.on("shopdataforuser", function(uuid, callback) {
        pool.query(`SELECT yourdinos FROM "public"."accounts" WHERE id=${uuid};`, function (err, results) {
            if(err) {
                callback([])
                return console.error(err);
            }
            var yourdinos = results["rows"][0]["yourdinos"];
            pool.query(`SELECT * FROM "public"."shop";`, function (err, result) {
                if (err) {
                    callback([])
                    return console.error(err);
                }
                var shop = result["rows"];
                var items = [];
                for (var i=0;i<shop.length;i++) {
                    console.log(shop[i])
                    var obj = {
                        dino: yourdinos[0]["dino"],
                        color: yourdinos[0]["color"],
                        kind: shop[i]["item"].split(":")[0],
                        item: shop[i]["item"].split(":")[1],
                        descr: shop[i]["descr"],
                        owned: yourdinos[0][shop[i]["item"].split(":")[0]].includes(parseInt(shop[i]["item"].split(":")[1])),
                        equipped: (yourdinos[0][`m${shop[i]["item"].split(":")[0]}`] == parseInt(shop[i]["item"].split(":")[1])),
                        name: shop[i]["name"],
                        price: shop[i]["price"]
                    };
                    items.push(obj)
                }
                callback(items)
            });
        })
    })
    socket.on("buyitem", function(uuid, kind, item, callback) {
        console.log(1)
        pool.query(`SELECT price FROM "public"."shop" WHERE item = '${kind}:${item}';`, function (err, price) {
            console.log(`${kind}:${item}`)
            if(err){
                callback([false, "Sorry, but an unexpected Error occured. Try reloading"]);
                return console.error(err);
            }
            console.log(2)
            pool.query(`SELECT skycoin, yourdinos FROM "public"."accounts" WHERE id='${uuid}';`, function (err, coins) {
                if(err){
                    callback([false, "Sorry, but an unexpected Error occured. Try reloading"]);
                    return console.error(err);
                }
                console.log(3)
                console.log("price: "+price.rows[0].price)
                if (price.rows[0].price >= coins.rows[0].skycoin) {
                    callback([false, "Not enough money"])
                } else {
                    console.log(4)
                    var yourdinos = coins["rows"][0]["yourdinos"];
                    console.log(yourdinos[0]);
                    if (!yourdinos[0][kind].includes(parseInt(item))){
                        yourdinos[0][`m${kind}`] = parseInt(item);
                        yourdinos[0][`${kind}`].push(parseInt(item));
                        pool.query(`UPDATE "public"."accounts" SET skycoin = skycoin - ${price["rows"][0]["price"]}, yourdinos = ${jsonarrpsql(yourdinos)} WHERE id = ${uuid};`, function (err, result) {
                            if (err) {
                                callback([false, "Sorry, but an unexpected Error occured. Try reloading"]);
                                return console.error(err);
                            } else {
                                callback([true])
                            }
                        });
                    } else {
                        callback([false, "Already bought that item."])
                    }
                }
            })
        });
    })
})

//Exposing Server to Internet
server.listen(PORT, console.log(`Listening on port ${PORT}.`));

//Additional Functions
function numlengen(len) {
    var num = "";
    for (var i = 0; i < len; i++) {
        num = num + `${Math.round(Math.random() * 9)}`;
    };
    return parseInt(num);
};

function replaceAll(str, find, replace) {
    var escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
};

function sqlbool(conditional) {
    if (conditional) {
        return "t";
    } else {
        return "f";
    };
};

function jsonarrpsql (arr) {
    var str = `ARRAY[`;
    for(i=0;i<arr.length;i++){
        str += `'${replaceAll(JSON.stringify(arr[i]), "'", "''")}'::json`
        if(i != arr.length - 1){
            str += ","
        }
    }
    str += `]`;
    return str;
}