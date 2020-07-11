/**
 * Basic configurations of the server
 * @author jimishio
 * @since 0.1
 * @version 0.1
 */

(function() {
    // export configuration parameters
    module.exports = {
        /** target port on which server will start listening */
        port: 8080,
        /** token key for verification of email address */
        signupJwtKey: "heregoesyourjwtkey",
        /** token expiry (in seconds) for verification of email address */
        signupJwtExipry: 84600,
        /** token key for logged in sessions */
        sessionJwtKey: "heregoesyoursessionjwtkey",
        /** token expiry (in seconds) for logged in sessions */
        sessionJwtExpiry: 2629743,
        /** token expiry (in seconds) for third party api users **/
        sessionThirdPartyJwtExpiry : 31556926,
        /** server ip address **/
        server : "35.198.15.19", //enter your server ip address
        /** mongo username **/
        db_username : "jimish", //enter your username
        /** mongo password **/
        db_password : "Pa$$Tutorial", //enter your password
        /** mongo database name **/
        db_name : "demo", //enter your database name
        /** mongodb port number **/
        db_port : 10618 // enter your port number
    }
})();