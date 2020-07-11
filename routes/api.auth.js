/**
 * API routes related to devices database
 * use "/" route while mapping
 * @author jimishio
 * @since 0.1
 * @version 0.1
 */

(function() {
    // named definitions
    var config = require("../config.js");
    var jwt = require("jsonwebtoken");
    var objectId = require("mongodb").ObjectID;
    var assert = require("assert");
    var https = require("https");
    var bcrypt = require("bcrypt");
    var urlencode = require("urlencode");
    var http = require('http');

    // export as api routing function
    module.exports = authApi;

    function authApi(app, express, db) {
        // initialize api router from express.js
        var apiRouter = express.Router();

        // map different routes to their path
        apiRouter.post("/signup", signUpWithRole);
        apiRouter.post("/login", slogin);


        // return router to use it in node.js
        return apiRouter;

        // subroutines
        

        function signUpWithRole(req, res){
            var isSuccess = false;
            var message = "Successfully registered user to our portal";

            // get necessary parameters from request body
            var email = req.body.email;

            var password = req.body.password;

            // check if password is empty in any case. return if true.
            if ((password == undefined) || (password == '') || (password == null)) {
                res.status(400).json({
                    message: "Empty password"
                });
                return;
            }

            // check if user already exists. if true, return error. otherwise shoot verification mail.
            
            var isEmail = false;

            var user = {};

            var response = {
                isSuccess : isSuccess,
                message : message,
                data : {}
            };

            if(req.body.email && req.body.password){
                var cursor = db.collection("users").find({
                    email: email
                });

                user = req.body;
                user.password = bcrypt.hashSync(password, 10);
                
                cursor.each(processCursor);

                function processCursor(err, doc) {
                    assert.equal(err, null, "[failed] mongodb query failed");
                    if (doc != null) {
                        isEmail = (email == doc.email);
                    } else {
                        
                        if (isEmail) {
                            response.data = [{"message": "email already exists"}];
                            response.isSuccess = false;
                            response.message = "email already exists";
                            // get user details and send token
                            res.status(409).json(response);
                        } else {
                            var gCursor = db.collection("users").find({}).sort({"id":-1}).limit(1);
                            gCursor.each(gProcessCursor);

                            function gProcessCursor(gErr, gDoc){
                                if(gErr){
                                    response = {
                                        isSuccess : isSuccess,
                                        message : message,
                                        data : {}
                                    };
                                    res.status(500).json(response);
                                } 
                                if(gDoc!=null){
                                    user.id = gDoc.id + 1;
                                } else {
                                    db.collection("users").insertOne(user, success);
    
                                    function success(err, result) {
                                        if (err) {
                                            res.status(503).json({
                                                message: "Server unavailable. Please try again."
                                            });
                                            return;
                                        }
                                        response.data = [{"message": "successfully signed up"}];
                                        response.isSuccess = true;
                                        // get user details and send token
                                        res.status(200).json(response);
                                    }
                                }
                            }
                            
                        }
                    }
                }
            }
        }

        
        function slogin(req, res) {
            // get necessary parameters from request body
            var email = req.body.email;
            var password = req.body.password;
            
            var isEmail = false, isValidated = false;

            var apiCounter = -2;

            var userId = null;

            var organization = {};

            // query database for incoming email address to get its details
            var cursor = db.collection("users").find({
                email: email
            });
            cursor.each(processCursor);

            function processCursor(err, doc) {
                var statusCode, message;
                if (err) {
                    res.status(503).json({
                        message: "Server unavailable. Please try again."
                    });
                    return;
                }
                if (doc != null) {
                    isEmail = (email == doc.email);
                    // validate incoming password with password hash string stored in database using bcrypt
                    isValidated = bcrypt.compareSync(password, doc.password);

                    //extract _id from mongo document
                    userId = doc.id;

                    apiCounter = doc.apiCounter;

                    organization = doc.organization;
                } else {
                    statusCode = (isEmail) ? ((isValidated) ? 200 : 404) : 404;
                    var responseJson = {};
                    if(isEmail && isValidated){
                        //if third party business api user or not, according expiry time to be set.
                        var apiExpiryTime = config.sessionJwtExpiry;

                        //generate jwt token 
                        var token = jwt.sign({
                            email: email,
                            role: 1
                        }, config.sessionJwtKey, {
                            expiresIn: apiExpiryTime
                        });
                        responseJson.token = token;
                        responseJson.userId = userId;

                        delete responseJson.apiCounter;
                    }

                    //assign proper message to responseJson
                    responseJson.message = (isEmail) ? ("Access " + ((isValidated) ? "granted" : "denied")) : "User not found!";
                    //http response. if valid then sent with token, otherwise 
                    res.status(statusCode).json(responseJson);
                }
            }
        }

    }
})();
