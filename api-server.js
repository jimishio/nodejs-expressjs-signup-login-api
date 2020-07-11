/**
 * Entry point to Server
 * @author jimishio
 * @since 0.1
 * @version 0.1
 */

(function() {
    // import modules
    var config = require("./config.js");
    var express = require("express");
    var cors = require("cors");
    var jwt = require("jsonwebtoken");
    var bodyParser = require("body-parser");
    var morgan = require("morgan");
    var path = require("path");
    var mongoClient = require("mongodb").MongoClient;
    var assert = require("assert");
    
    // named definitions
    var app = express();
    var connectionString = config.db_username + ":" + config.db_password + "@";
    var dbHostUrl = "mongodb://"+connectionString+config.server+":"+config.db_port+"/";
    var mongodb;                                                   
    // will be assigned database object when mongodb connection pool has been established

    // use body parser so we can grab information from POST requests
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '5mb'
    }));
    app.use(bodyParser.json({limit: '50mb'}));

    // CORS - Cross Site Resources Sharing
    app.use(cors());
    app.use(handleCORSRequests);

    // log all requests to the console 
    app.use(morgan('combined'));

    // app.use(bodyParser({limit: '50mb'}));

    // app.use(bodyParser.json({limit: '50mb'}));

    // connect to mongodb server
    mongoClient.connect(dbHostUrl + config.db_name, runMongo);

    // listen to the configured port and start Server
    app.listen(config.port);
    console.log("[success] starting Node.js server. Url=http://localhost:" + config.port);

    process.on("SIGINT", killProcess);

    // subroutines

    // add header parameters to every request object
    function handleCORSRequests(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
        next();
    }

    // handle onExit interrupt
    function killProcess() {
        console.log(".");
        console.log("[success] stopping Node.js server.");
        if (mongodb)
            mongodb.close();
        process.exit();
    }

    

    // subroutine to initialize mongodb api when connection has been established
    function runMongo(err, db) {
        assert.equal(null, err, "[failed] establishing connection to mongodb");
        console.log("MongoDB Connected");
        mongodb = db;

        var authApi = require("./routes/api.auth.js")(app, express, db);
        
        app.use("/", authApi);
        
        // ---------------------------------------------------------
        // route middleware to authenticate and check token
        // ---------------------------------------------------------
        app.use(authInterceptor);



        function authInterceptor(req, res, next) {
            // check header or url parameters or post parameters for token
            var token = req.headers['your-custom-token'];

            // decode token
            if (token) {
                // verifies secret and checks exp
                jwt.verify(token, config.sessionJwtKey, verifyJwt);
            } else {
                // if there is no token
                // return an error
                return res.status(403).send({ 
                    success: false, 
                    message: 'No token provided.'
                });
            }

            function verifyJwt(err, decoded) {
                if (err)
                    return res.status(401).json({ success: false, message: 'Failed to authenticate token.'});
                else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;  

                    // check if decoded value matches with user information saved in database.
                    db.collection("users").findOne({
                        email : req.decoded.email,
                        role : req.decoded.role
                    }, function(err, obj){
                        if(err){
                            return res.status(401).send({ 
                                success: false, 
                                message: 'failed to authenticate token.'
                            });
                        } else {
                            next();
                        }
                    })
                    
                }
            }
        }
    }
})();