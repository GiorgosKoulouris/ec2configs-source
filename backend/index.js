require('dotenv').config();
var http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { randomUUID } = require("crypto");

const passport = require('passport');
const passportAzureAd = require('passport-azure-ad');
const authConfig = require('./authConfig');
const router = require('./routes/index');

const loginLog = require('./helperFunctions/functions').loginLog;

const app = express();
const port = 30002

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Methods', 'Content-Type', 'Authorization');
    next();
})
app.set('trust proxy', true);
app.use(cors());
app.use(bodyParser.json());

const bearerStrategy = new passportAzureAd.BearerStrategy({
    identityMetadata: `https://${authConfig.metadata.authority}/${authConfig.credentials.tenantID}/${authConfig.metadata.version}/${authConfig.metadata.discovery}`,
    issuer: `https://${authConfig.metadata.authority}/${authConfig.credentials.tenantID}/${authConfig.metadata.version}`,
    clientID: authConfig.credentials.clientID,
    audience: authConfig.credentials.clientID, // audience is this application
    validateIssuer: authConfig.settings.validateIssuer,
    passReqToCallback: authConfig.settings.passReqToCallback,
    loggingLevel: authConfig.settings.loggingLevel,
    loggingNoPII: authConfig.settings.loggingNoPII
}, (req, token, done) => {

    /**
     * Below you can do extended token validation and check for additional claims, such as:
     * - check if the caller's tenant is in the allowed tenants list via the 'tid' claim (for multi-tenant applications)
     * - check if the caller's account is homed or guest via the 'acct' optional claim
     * - check if the caller belongs to right roles or groups via the 'roles' or 'groups' claim, respectively
     *
     * Bear in mind that you can do any of the above checks within the individual routes and/or controllers as well.
     * For more information, visit: https://docs.microsoft.com/azure/active-directory/develop/access-tokens#validate-the-user-has-permission-to-access-this-data
     */


    /**
     * Lines below verifies if the caller's client ID is in the list of allowed clients.
     * This ensures only the applications with the right client ID can access this API.
     * To do so, we use "azp" claim in the access token. Uncomment the lines below to enable this check.
     */

    // const myAllowedClientsList = [
    //     /* add here the client IDs of the applications that are allowed to call this API */
    // ]

    // if (!myAllowedClientsList.includes(token.azp)) {
    //     return done(new Error('Unauthorized'), {}, "Client not allowed");
    // }


    /**
     * Access tokens that have neither the 'scp' (for delegated permissions) nor
     * 'roles' (for application permissions) claim are not to be honored.
     */
    if (!token.hasOwnProperty('scp') && !token.hasOwnProperty('roles')) {
        return done(new Error('Unauthorized'), null, "No delegated or app permission claims found");
    }

    /**
     * If needed, pass down additional user info to route using the second argument below.
     * This information will be available in the req.user object.
     */
    return done(null, {}, token);
});


app.use(passport.initialize());
passport.use(bearerStrategy);

app.use('/', (req, res, next) => {
    passport.authenticate('oauth-bearer', {
        session: false,

        /**
         * If you are building a multi-tenant application and you need supply the tenant ID or name dynamically,
         * uncomment the line below and pass in the tenant information. For more information, see:
         * https://github.com/AzureAD/passport-azure-ad#423-options-available-for-passportauthenticate
         */

        // tenantIdOrName: <some-tenant-id-or-name>

    }, (err, user, info) => {
        if (err) {
            /**
             * An error occurred during authorization. Either pass the error to the next function
             * for Express error handler to handle, or send a response with the appropriate status code.
             */
            return res.status(401).json({ error: err.message });
        }

        if (!user) {
            // If no user object found, send a 401 response.
            let log = {
                id: randomUUID(),
                userEmail: "N/A",
                userName: "N/A",
                isAdmin: "N/A",
                ip: req.ip,
                error: "No valid user was found. Unauthorized."
            }
            loginLog(log);
            // console.log(req);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (info) {
            // access token payload will be available in req.authInfo downstream
            req.authInfo = info;
            return next();
        }
    })(req, res, next);
},
    router, // the router with all the routes
    (err, req, res, next) => {
        /**
         * Add your custom error handling logic here. For more information, see:
         * http://expressjs.com/en/guide/error-handling.html
         */

        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // send error response
        res.status(err.status || 500).send(err);
    }
);


var server = http.createServer({}, app).listen(port, function () {
    console.log("Backend server listening on port " + port);
});
