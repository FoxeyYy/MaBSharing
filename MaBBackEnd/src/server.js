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
        const authorization = request.header('Authorization');
        return (
            authorization.startsWith('Bearer ') ?
                authorization.split(' ')[1] :
                authorization);
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
            const payload = jwt.verify(token, process.env.SECRET);
            request.body.user_email = payload.email;
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
            then(
                user =>
                {
                    return bcrypt.compare(password, user.password);
                }).
            then(
                (passwordMatch) =>
                {
                    if (passwordMatch)
                    {
                        response.status(200).send({ token: generateJWT(email) });
                    }
                    else
                    {
                        throw new Error('Invalid credentials.');
                    }
                }).
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


/**
 * Group all user routes under the same router.
 *
 * @const
 * @type {express.Router}
 *
 * @see {@link http://expressjs.com/en/4x/api.html#router}
 */
const userRoutes = express.Router();


/**
 * GET {userRoutes}/events
 *
 * Returns the events related to the user identified by the JWT sent in
 * the request.
 */
userRoutes.get(
    '/events',
    ensureAuthenticated,
    (request, response) =>
    {
        response.status(501).end();
    });


/**
 * GET {userRoutes}/friends
 *
 * Returns the friends of the user identified by the JWT sent in the
 * request.
 */
userRoutes.get(
    '/friends',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchFriends(request.body.user_email).
            then((friends) => response.status(200).send({ friends })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * GET {userRoutes}/friendship_requests
 *
 * Returns the pending friendship requests of the user identified by the
 * JWT sent in the request.
 */
userRoutes.get(
    '/friendship_requests',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchFriendshipRequests(request.body.user_email).
            then((friendship_requests) => response.status(200).send({ friendship_requests })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * POST {userRoutes}/friendship_requests
 *
 * Adds a new friendship requests from the user identified by the JWT
 * sent in the request.
 */
userRoutes.post(
    '/friendship_requests',
    ensureAuthenticated,
    (request, response) =>
    {
        db.insertFriendshipRequest(request.body.user_email, request.body.dest_user_id).
            then((id) => response.status(200).send({ id })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * PATCH {userRoutes}/friendship_requests/
 *
 * Accepts/Denies a friendship requests directed towards the user
 * identified by the JWT sent in the request.
 */
userRoutes.patch(
    '/friendship_requests/:dest_user_id',
    ensureAuthenticated,
    (request, response) =>
    {
        (request.body.accepted === 'true') ?
            db.acceptFriendshipRequest(request.body.user_email, request.params.dest_user_id).
                then((id) => response.status(200).send({ id })).
                catch((error) => response.status(500).send({ error })) :
            db.denyFriendshipRequest(request.body.user_email, request.params.dest_user_id).
                then((id) => response.status(200).send({ id })).
                catch((error) => response.status(500).send({ error }));
    });


/**
 * POST {userRoutes}/search
 *
 * Searches all matching users given a search term.
 */
userRoutes.post(
    '/search',
    ensureAuthenticated,
    (request, response) =>
    {
        db.searchUsers(request.body.term).
            then((users) => response.status(200).send({ users })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * GET {userRoutes}/wishlist
 *
 * Returns the wish list of the user identified by the JWT sent in the
 * request.
 */
userRoutes.get(
    '/wishlist',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchWishList(request.body.user_email).
            then((wishlist) => response.status(200).send({ wishlist })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * POST {userRoutes}/wishlist/:resource
 *
 * Adds a new resource to the wish list of the user identified by the
 * JWT sent in the request.
 */
userRoutes.post(
    '/wishlist',
    ensureAuthenticated,
    (request, response) =>
    {
        db.insertOnWishList(request.body.user_email, request.body.id).
            then((id) => response.status(201).send({ resource_id })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * GET {userRoutes}/marked
 *
 * Returns the list of resources marked as seen/read by the user
 * identified by the JWT sent in the request.
 */
userRoutes.get(
    '/marked',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchMarkedList(request.body.user_email).
            then((marked) => response.status(200).send({ marked })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * POST {userRoutes}/marked
 *
 * Adds a new resource to the list of books read or movies watched by
 * the user identified by the JWT sent in the request.
 */
userRoutes.post(
    '/marked',
    ensureAuthenticated,
    (request, response) =>
    {
        db.insertOnMarkedList(request.body.user_email, request.body.id).
            then((resource_id) => response.status(201).send({ resource_id })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * GET {userRoutes}/ratings
 *
 * Returns the list of resources rated by the user identified by the JWT
 * sent in the request.
 */
userRoutes.get(
    '/ratings',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchRatedList(request.body.user_email).
            then((ratings) => response.status(200).send({ ratings })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * POST {userRoutes}/ratings
 *
 * Adds a new resource to the list of books read or movies rated by the
 * user identified by the JWT sent in the request.
 */
userRoutes.post(
    '/ratings',
    ensureAuthenticated,
    (request, response) =>
    {
        db.insertOnRatedList(request.body.user_email, request.body.id, request.body.liked).
            then((resource_id) => response.status(201).send({ resource_id })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * PATCH {userRoutes}/ratings/:resource_id
 *
 * Updates a resource rating given by the user identified by the JWT
 * sent in the request.
 */
userRoutes.patch(
    '/ratings/:resource_id',
    ensureAuthenticated,
    (request, response) =>
    {
        db.updateRating(request.body.user_email, request.params.resource_id, request.body.liked).
            then((resource_id) => response.status(201).send({ resource_id })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * GET {userRoutes}/:profile
 *
 * Returns the information about an user.
 */
userRoutes.get(
    '/profile',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchUser(request.body.user_email).
            then((user) => response.status(200).send({ user: { id: user.id, email: user.email } })).
            catch((error) => response.status(500).end());
    });


/**
 * GET {userRoutes}/:id
 *
 * Returns the information about an user.
 */
userRoutes.get(
    '/:id',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchUserById(request.params.id).
            then((user) => response.status(200).send({ user })).
            catch((error) => response.status(500).end());
    });


// Add the user routes to the Express application.
app.use('/user', userRoutes);




//  88888888ba
//  88      "8b
//  88      ,8P
//  88aaaaaa8P'  ,adPPYba,  ,adPPYba,   ,adPPYba,   88       88  8b,dPPYba,   ,adPPYba,   ,adPPYba,
//  88""""88'   a8P_____88  I8[    ""  a8"     "8a  88       88  88P'   "Y8  a8"     ""  a8P_____88
//  88    `8b   8PP"""""""   `"Y8ba,   8b       d8  88       88  88          8b          8PP"""""""
//  88     `8b  "8b,   ,aa  aa    ]8I  "8a,   ,a8"  "8a,   ,a88  88          "8a,   ,aa  "8b,   ,aa
//  88      `8b  `"Ybbd8"'  `"YbbdP"'   `"YbbdP"'    `"YbbdP'Y8  88           `"Ybbd8"'   `"Ybbd8"'
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



/**
 * Group all resource routes under the same router.
 *
 * @const
 * @type {express.Router}
 *
 * @see {@link http://expressjs.com/en/4x/api.html#router}
 */
const resourceRoutes = express.Router();



/**
 * GET {resourceRoutes}/book/:id
 *
 * Returns the information about a book.
 */
resourceRoutes.get(
    '/book/:id',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchBookById(request.params.id).
            then((book) => response.status(200).send({ book })).
            catch((error) => response.status(500).end());
    });


/**
 * POST {resourceRoutes}/book
 *
 * Adds a new book to the platform.
 */
resourceRoutes.post(
    '/book',
    ensureAuthenticated,
    (request, response) =>
    {
        const book =
        {
            name: request.body.name,
            releaseDate: request.body.release_date,
            userEmail: request.body.user_email,
            writer: request.body.writer,
            edition: request.body.edition,
        };

        db.insertBook(book).
            then((resource_id) => response.status(201).send({ resource_id })).
            catch((error) => response.status(500).end());
    });


/**
 * GET {resourceRoutes}/movie/:id
 *
 * Returns the information about a movie.
 */
resourceRoutes.get(
    '/movie/:id',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchMovieById(request.params.id).
            then((movie) => response.status(200).send({ movie })).
            catch((error) => response.status(500).end())
    });


/**
 * POST {resourceRoutes}/movie
 *
 * Adds a new movie to the platform.
 */
resourceRoutes.post(
    '/movie',
    ensureAuthenticated,
    (request, response) =>
    {
        const movie =
        {
            name: request.body.name,
            releaseDate: request.body.release_date,
            userEmail: request.body.user_email,
            director: request.body.director,
        };

        db.insertMovie(movie).
            then((resource_id) => response.status(201).send({ resource_id })).
            catch((error) => response.status(500).end());
    });


/**
 * GET {resourceRoutes}/:resource/comments
 *
 * Returns the a new comment to the given resource.
 */
resourceRoutes.get(
    '/:resource_id/comments',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchComments(request.params.resource_id).
            then((comments) => response.status(200).send({ comments })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * POST {resourceRoutes}/:resource/comments
 *
 * Adds a new comment to the given resource.
 */
resourceRoutes.post(
    '/:resource_id/comments',
    ensureAuthenticated,
    (request, response) =>
    {
        db.insertComment(request.body.user_email, request.params.resource_id, request.body.comment).
            then((resource_id) => response.status(200).send({ resource_id })).
            catch((error) => response.status(500).send({ error }));
    });


/**
 * GET {resourceRoutes}/:resource/ratings
 *
 * Returns the a new rating to the given resource.
 */
resourceRoutes.get(
    '/:resource_id/ratings',
    ensureAuthenticated,
    (request, response) =>
    {
        db.fetchRatings(request.params.resource_id).
            then((ratings) => response.status(200).send(ratings));
    });


/**
 * POST {resourceRoutes}/search
 *
 * Searches all matching resources given a search term.
 */
resourceRoutes.post(
    '/search',
    ensureAuthenticated,
    (request, response) =>
    {
        db.searchResources(request.body.term).
            then((results) => response.status(200).send(results)).
            catch((error) => response.status(500).send({ error }));

    });


// Add the resource routes to the Express application.
app.use('/resources', resourceRoutes);




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
