/**
 MaBSharing back end Express.js application.
 *
 * @module src/server
 */


const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const expressWinston = require('express-winston');
const winston = require('winston');

const db = require('./db');

const IN_DEVELOPMENT = (process.env.NODE_ENV === 'development');




//  88888888888
//  88
//  88
//  88aaaaa     8b,     ,d8 8b,dPPYba,  8b,dPPYba,  ,adPPYba, ,adPPYba, ,adPPYba,
//  88"""""      `Y8, ,8P'  88P'    "8a 88P'   "Y8 a8P_____88 I8[    "" I8[    ""
//  88             )888(    88       d8 88         8PP"""""""  `"Y8ba,   `"Y8ba,
//  88           ,d8" "8b,  88b,   ,a8" 88         "8b,   ,aa aa    ]8I aa    ]8I
//  88888888888 8P'     `Y8 88`YbbdP"'  88          `"Ybbd8"' `"YbbdP"' `"YbbdP"'
//                          88
//                          88


// Create the Express application.
const app = express();

// Enable CORS.
app.use(cors());

// Enable parsing of data from a POST body or URL parameters.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Set up logging of all requests made to the app to the console.
const requestLogger = expressWinston.logger(
    {
        transports:
        [
            new winston.transports.Console(
                {
                    json: false,
                    colorize: IN_DEVELOPMENT
                })
        ],
        expressFormat: true,
        level: IN_DEVELOPMENT ? 'debug' : 'info'
    });

app.use(requestLogger);


// Set up logging of important errors that occur within the app.
const errorLogger = expressWinston.errorLogger(
    {
        transports:
        [
            new winston.transports.Console(
                {
                    json: true,
                    colorize: IN_DEVELOPMENT
                })
        ]
    });

app.use(errorLogger);


/**
 * Extracts a JSON web token (JWT) from a HTTP request.
 *
 * @param {express.Request} request
 * @returns {String} JSON web token (JWT) contained in the request.
 */
const jwtTokenIn = function (request)
{
    if (request.header('Authorization'))
    {
        return request.header('Authorization').split(' ')[1];
    }
    else
    {
        return request.body.token || request.query.token || request.headers['x-access-token'];
    }
};


/**
 * Middleware to check that a request contains a valid
 * JSON web token (JWT).
 *
 * In case the JWT is valid, its subject claim would be added to the
 * request object as the field 'user'.
 */
const ensureAuthenticated = function (request, response, next)
{
    const token = jwtTokenIn(request);

    if (token)
    {
        try
        {
            // TODO: Validate token.
            next();
        }
        catch (error)
        {
            response.status(401).send({ error: 'Invalid token.' });
        }
    }
    else
    {
        response.status(403).send({ error: 'No token provided.'});
    }
};




//  88888888ba                       88
//  88      "8b                      ""
//  88      ,8P
//  88aaaaaa8P' ,adPPYYba, ,adPPYba, 88  ,adPPYba,
//  88""""""8b, ""     `Y8 I8[    "" 88 a8"     ""
//  88      `8b ,adPPPPP88  `"Y8ba,  88 8b
//  88      a8P 88,    ,88 aa    ]8I 88 "8a,   ,aa
//  88888888P"  `"8bbdP"Y8 `"YbbdP"' 88  `"Ybbd8"'
//
//
//  88888888ba
//  88      "8b                          ,d
//  88      ,8P                          88
//  88aaaaaa8P' ,adPPYba,  88       88 MM88MMM ,adPPYba, ,adPPYba,
//  88""""88'  a8"     "8a 88       88   88   a8P_____88 I8[    ""
//  88    `8b  8b       d8 88       88   88   8PP"""""""  `"Y8ba,
//  88     `8b "8a,   ,a8" "8a,   ,a88   88,  "8b,   ,aa aa    ]8I
//  88      `8b `"YbbdP"'   `"YbbdP'Y8   "Y888 `"Ybbd8"' `"YbbdP"'


/**
 * GET /
 *
 * Base route that only returns a greeting.
 */
app.get(
    '/',
    (request, response) =>
    {
        response.send('Welcome to the MaBSharing API.');
    });




//         db                           88
//        d88b                    ,d    88
//       d8'`8b                   88    88
//      d8'  `8b    88       88 MM88MMM 88,dPPYba,
//     d8YaaaaY8b   88       88   88    88P'    "8a
//    d8""""""""8b  88       88   88    88       88
//   d8'        `8b "8a,   ,a88   88,   88       88
//  d8'          `8b `"YbbdP'Y8   "Y888 88       88
//
//
//  88888888ba
//  88      "8b                          ,d
//  88      ,8P                          88
//  88aaaaaa8P' ,adPPYba,  88       88 MM88MMM ,adPPYba, ,adPPYba,
//  88""""88'  a8"     "8a 88       88   88   a8P_____88 I8[    ""
//  88    `8b  8b       d8 88       88   88   8PP"""""""  `"Y8ba,
//  88     `8b "8a,   ,a8" "8a,   ,a88   88,  "8b,   ,aa aa    ]8I
//  88      `8b `"YbbdP"'   `"YbbdP'Y8   "Y888 `"Ybbd8"' `"YbbdP"'


/**
 * Group all authentication service routes under the same router.
 *
 * @const
 * @type {express.Router}
 *
 * @see {@link http://expressjs.com/en/4x/api.html#router}
 */
const authRoutes = express.Router();


/**
 * Registers  a user on the platform.
 *
 * @param {string} email
 * @param {string} password Plain-text password
 * @returns {Promise} Resolves on successful registration.
 */
const signUpUser = (email, password) =>
{
    return new Promise(
        (resolve, reject) =>
        {
            password ?
                resolve(db.insertUser(email, bcrypt.hashSync(password))) :
                reject('Empty password');
        });
};


/**
 * Generates a JSON Web Token (JWT).
 *
 * @param {string} email Email of a user which will be identified by the JWT.
 * @returns {string} JWT authenticating the user with the given email.
 */
const generateJWT = (email) =>
{
    return jwt.sign(
        { email: email },
        process.env.SECRET,
        { expiresIn: 86400 });
};


/**
 * POST {authRoutes}/signup
 *
 * Signs up a new user on the platform.
 */
authRoutes.post(
    '/signup',
    (request, response) =>
    {
        const email = request.body.email;
        const password = request.body.password;

        signUpUser(email, password).
            then(() => response.status(201).send({ token: generateJWT(email) })).
            catch(() => response.status(400).send({ error: 'Provided email and password are invalid.' }));
    });


/**
 * POST {authRoutes}/login
 *
 * Logs in a user on the platform.
 */
authRoutes.post(
    '/login',
    (request, response) =>
    {
        const email = request.body.email;
        const password = request.body.password;

        db.fetchUser(email).
            then(user => bcrypt.compare(password, user.password)).
            then(() => response.status(200).send({ token: generateJWT(email) })).
            catch(() => response.status(400).send({ error: 'Invalid credentials.'}));
    });


// Add the authentication routes to the Express application.
app.use('/auth', authRoutes);




//  88        88
//  88        88
//  88        88
//  88        88  ,adPPYba,   ,adPPYba,  8b,dPPYba,
//  88        88  I8[    ""  a8P_____88  88P'   "Y8
//  88        88   `"Y8ba,   8PP"""""""  88
//  Y8a.    .a8P  aa    ]8I  "8b,   ,aa  88
//   `"Y8888Y"'   `"YbbdP"'   `"Ybbd8"'  88
//
//
//
//  88888888ba
//  88      "8b                             ,d
//  88      ,8P                             88
//  88aaaaaa8P'  ,adPPYba,   88       88  MM88MMM  ,adPPYba,  ,adPPYba,
//  88""""88'   a8"     "8a  88       88    88    a8P_____88  I8[    ""
//  88    `8b   8b       d8  88       88    88    8PP"""""""   `"Y8ba,
//  88     `8b  "8a,   ,a8"  "8a,   ,a88    88,   "8b,   ,aa  aa    ]8I
//  88      `8b  `"YbbdP"'    `"YbbdP'Y8    "Y888  `"Ybbd8"'  `"YbbdP"'






//  88888888888
//  88                                                                ,d
//  88                                                                88
//  88aaaaa      8b,     ,d8  8b,dPPYba,    ,adPPYba,   8b,dPPYba,  MM88MMM
//  88"""""       `Y8, ,8P'   88P'    "8a  a8"     "8a  88P'   "Y8    88
//  88              )888(     88       d8  8b       d8  88            88
//  88            ,d8" "8b,   88b,   ,a8"  "8a,   ,a8"  88            88,
//  88888888888  8P'     `Y8  88`YbbdP"'    `"YbbdP"'   88            "Y888
//                            88
//                            88


module.exports =
{
    app,
};
