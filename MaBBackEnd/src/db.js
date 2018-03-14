/**
 MaBSharing module to access the database.
 *
 * @module src/db
 */


const knex = require('knex');


//    ,ad8888ba,                               ad88  88
//   d8"'    `"8b                             d8"    ""
//  d8'                                       88
//  88              ,adPPYba,   8b,dPPYba,  MM88MMM  88   ,adPPYb,d8
//  88             a8"     "8a  88P'   `"8a   88     88  a8"    `Y88
//  Y8,            8b       d8  88       88   88     88  8b       88
//   Y8a.    .a8P  "8a,   ,a8"  88       88   88     88  "8a,   ,d88
//    `"Y8888Y"'    `"YbbdP"'   88       88   88     88   `"YbbdP"Y8
//                                                        aa,    ,88
//                                                         "Y8bbdP"


const db =
    knex(
        {
            client: "mariasql",
            connection:
            {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                db: process.env.DB_DATABASE,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            }
        });


//  88        88
//  88        88
//  88        88
//  88        88  ,adPPYba,   ,adPPYba,  8b,dPPYba,  ,adPPYba,
//  88        88  I8[    ""  a8P_____88  88P'   "Y8  I8[    ""
//  88        88   `"Y8ba,   8PP"""""""  88           `"Y8ba,
//  Y8a.    .a8P  aa    ]8I  "8b,   ,aa  88          aa    ]8I
//   `"Y8888Y"'   `"YbbdP"'   `"Ybbd8"'  88          `"YbbdP"'


/**
 * Fetches a user from the database given its email address.
 *
 * @param {string} email
 * @returns { { id: number, email: string, password: string } }
 */
const fetchUser = (email) =>
{
    return db.
        select('id', 'email', 'password').
        from('user').
        where({ email }).
        then(
            rows =>
            {
                if (rows.length == 0)
                {
                    throw new Error('Invalid credentials.');
                }
                else
                {
                    return rows[0];
                }
            })
};


/**
 * Inserts a new user on the database.
 *
 * @param {string} email
 * @param {string} password
 * @returns {string} Identifier of the new user on the database.
 */
const insertUser = (email, password) =>
{
    return db('user').
        insert(
            {
                email,
                password,
                creationDate: new Date().toISOString().split('T')[0]
            });
};


/**
 * Search for matching users.
 *
 * @param {string} term
 * @returns {Promise} Resolves to search results array.
 */
const searchUsers = (term) =>
    db.select('id', 'email', 'creationDate').
        from('user').
        whereRaw(`MATCH(user.email) AGAINST ('${term}')`);


/**
 * Returns the friends id where a user, given its id, was the origin of
 * the friendship request.
 *
 * @param {number} userID
 * @returns {Promise<Array<number>>} Friends Id.
 */
const fetchOriginFriends = (userID) =>
    db('friendrequest').
        select('dest_author_id').
        where('accepted', '=', '1').
        andWhere('orig_author_id', '=', userID).
        then((rows) => rows.map(row => row['dest_author_id']));


/**
 * Returns the friends id where a user, given its id, was the destiny of
 * the friendship request.
 *
 * @param {number} userID
 * @returns {Promise<Array<number>>} Friends Id.
 */
const fetchDestinyFriends = (userID) =>
    db('friendrequest').
        select('orig_author_id').
        where('accepted', '=', '1').
        andWhere('dest_author_id', '=', userID).
        then((rows) => rows.map(row => row['orig_author_id']));


/**
 * Returns the friends of a user given its email address.
 *
 * @param {string} userEmail
 * @returns {Promise<Array<number>>} Resolves to the friends Id.
 */
const fetchFriends = (userEmail) =>
    fetchUser(userEmail).
        then((user) => Promise.all([fetchOriginFriends(user.id), fetchDestinyFriends(user.id)])).
        then(([origFriends, destFriends]) => origFriends.concat(destFriends));


const fetchFriendshipRequests = (userEmail) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('friendrequest').
                    select('orig_author_id').
                    whereNull('accepted').
                    andWhere('dest_author_id', '=', user.id).
                    then((rows) => rows.map(row => row['orig_author_id'])));


/**
 * Adds a new friendship request from a user given its email address
 * towards another user given its id.
 *
 * @param {string} userEmail
 * @param {number} destUserID
 *
 * @returns {Promise<number>} Resolves to the destiny user Id.
 */
const insertFriendshipRequest = (userEmail, destUserID) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('friendrequest').
                insert(
                    {
                        creation_date: new Date().toISOString().split('T')[0],
                        review_date: null,
                        accepted: null,
                        orig_author_id: user.id,
                        dest_author_id: destUserID,
                    })).
        then(() => destUserID);


const acceptFriendshipRequest = (userEmail, destUserID) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('friendrequest').
                    whereNull('accepted').
                    andWhere('orig_author_id', '=', user.id).
                    andWhere('dest_author_id', '=', destUserID).
                    update(
                        {
                            review_date: new Date().toISOString().split('T')[0],
                            accepted: 1,
                        })).
        then(() => destUserID);


const denyFriendshipRequest = (userEmail, destUserID) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('friendrequest').
                    whereNull('accepted').
                    andWhere('orig_author_id', '=', user.id).
                    andWhere('dest_author_id', '=', destUserID).
                    update(
                        {
                            review_date: new Date().toISOString().split('T')[0],
                            accepted: 0,
                        })).
        then(() => destUserID);


/**
 * Returns the resources ids in a user wish list.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to the resources ids.
 */
const fetchResourcesOnWishList = (userID) =>
    db('wishlist').select('resource_id').where('author_id', '=', userID);


/**
 * Returns the books in a user wish list.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to books on wish list.
 */
const fetchBooksOnWishList = (userID) =>
    db.from('resources').
        select('resource_id', 'name', 'releaseDate', 'edition', 'writer').
        innerJoin('book', 'resources.id', 'book.resource_id').
        where('resources.id', 'in', fetchResourcesOnWishList(userID));

/**
 * Returns the movies in a user wish list.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to books on wish list.
 */
const fetchMoviesOnWishList = (userID) =>
    db.from('resources').
        select('resource_id', 'name', 'releaseDate', 'director').
        innerJoin('movie', 'resources.id', 'movie.resource_id').
        where('resources.id', 'in', fetchResourcesOnWishList(userID));

/**
 *
 * @param {string} userEmail
 * @returns {Promise<Array>} Resolves to the user wish list.
 */
const fetchWishList = (userEmail) =>
    fetchUser(userEmail).
        then(
            (user) =>
                Promise.all(
                    [
                        fetchBooksOnWishList(user.id),
                        fetchMoviesOnWishList(user.id),
                    ])).
        then(([books, movies]) => ({ books, movies }));


/**
 * Inserts a new item on a user wishlist.
 *
 * @param {string} userEmail
 * @param {number} resourceID
 *
 * @returns {Promise<number>} Item id on the wish list.
 */
const insertOnWishList = (userEmail, resourceID) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('wishlist').
                    insert(
                        {
                            author_id: user.id,
                            resource_id: resourceID,
                        }).
                    then(() => resourceID));




//  88888888ba
//  88      "8b
//  88      ,8P
//  88aaaaaa8P'  ,adPPYba,  ,adPPYba,   ,adPPYba,   88       88  8b,dPPYba,   ,adPPYba,   ,adPPYba,  ,adPPYba,
//  88""""88'   a8P_____88  I8[    ""  a8"     "8a  88       88  88P'   "Y8  a8"     ""  a8P_____88  I8[    ""
//  88    `8b   8PP"""""""   `"Y8ba,   8b       d8  88       88  88          8b          8PP"""""""   `"Y8ba,
//  88     `8b  "8b,   ,aa  aa    ]8I  "8a,   ,a8"  "8a,   ,a88  88          "8a,   ,aa  "8b,   ,aa  aa    ]8I
//  88      `8b  `"Ybbd8"'  `"YbbdP"'   `"YbbdP"'    `"YbbdP'Y8  88           `"Ybbd8"'   `"Ybbd8"'  `"YbbdP"'


/**
 * Fetches a book from the database given its id.
 *
 * @param {number} id
 * @returns {object} Matching book.
 */
const fetchBookById = (id) =>
{
    return db.
        from('resources').
        where('id', id).
        innerJoin('book', 'resources.id', 'book.resource_id').
        then(
            (rows) =>
            {
                if (rows.length == 0)
                {
                    return ({});
                }
                else
                {
                    return (
                        {
                            name: rows[0].name,
                            release_date: rows[0].releaseDate,
                            edition: rows[0].edition,
                            writer: rows[0].writer,
                        });
                }
            });
};


/**
 * Inserts a new book on the database.
 *
 * The fields needed to create a new book are:
 *
 *   - name
 *   - releaseDate
 *   - userEmail
 *   - writer
 *   - edition
 *
 * @param {object} book
 * @returns {number} Identifier of the new book on the database.
 */
const insertBook = ({ name, releaseDate, userEmail, writer, edition }) =>
{
    return fetchUser(userEmail).
        then(
            (user) =>
            {
                return db.transaction(
                    (trx) =>
                    {
                        return trx.
                            insert(
                                {
                                    name,
                                    creationDate: new Date().toISOString().split('T')[0],
                                    releaseDate,
                                    author_id: user.id,
                                }).
                            into('resources').
                            then(
                                (ids) =>
                                {
                                    return trx.
                                        returning('resource_id').
                                        insert(
                                            {
                                                edition,
                                                writer,
                                                resource_id: ids[0],
                                            }).
                                        into('book');
                                });
                    }).
                    then(
                        (inserts) =>
                        {
                            return inserts[0][0];
                        });
            });
};


/**
 * Fetches a book from the database given its id.
 *
 * @param {number} id
 * @returns {object} Matching movie.
 */
const fetchMovieById = (id) =>
{
    return db.
        from('resources').
        innerJoin('movie', 'resources.id', 'movie.resource_id').
        where('resources.id', id).
        then(
            (rows) =>
            {
                if (rows.length == 0)
                {
                    throw new Error('Invalid credentials.');
                }
                else
                {
                    return (
                        {
                            name: rows[0].name,
                            release_date: rows[0].releaseDate,
                            director: rows[0].director,
                        });
                }
            })
};


/**
 * Inserts a new movie on the database.
 *
 * The fields needed to create a new movie are:
 *
 *   - name
 *   - releaseDate
 *   - userEmail
 *   - director
 *
 * @param {object} movie
 * @returns {number} Identifier of the new movie on the database.
 */
const insertMovie = ({ name, releaseDate, userEmail, director }) =>
{
    return fetchUser(userEmail).
        then(
            (user) =>
            {
                return db.transaction(
                    (trx) =>
                    {
                        return trx.
                            insert(
                                {
                                    name,
                                    creationDate: new Date().toISOString().split('T')[0],
                                    releaseDate,
                                    author_id: user.id,
                                }).
                            into('resources').
                            then(
                                (ids) =>
                                {
                                    return trx.
                                        returning('resource_id').
                                        insert(
                                            {
                                                director,
                                                resource_id: ids[0],
                                            }).
                                        into('movie');
                                });
                    }).
                    then(
                        (inserts) =>
                        {
                            return inserts[0][0];
                        });
            })
};


/**
 * Fetches the comments make about a resource.
 *
 * @param {number} movieID
 * @returns {Promise<Array>} Comments.
 */
const fetchComments = (movieID) =>
{
    return db.
        from('comment').
        where('resource_id', '=', movieID).
        then(
            (rows) =>
            {
                return rows;
            })
};


/**
 * Inserts a new comment about a resource by a user.
 *
 * @param {string} userEmail
 * @param {number} resourceID
 * @param {string} comment
 *
 * @returns {Promise<number>} Resolves to the resource id.
 */
const insertComment = (userEmail, resourceID, comment) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('comment').
                    insert(
                        {
                            creationDate: new Date().toISOString().split('T')[0],
                            author_id: user.id,
                            resource_id: resourceID,
                            comment,
                        }).
                    then(() => resourceID));




//   ad88888ba                                                   88
//  d8"     "8b                                                  88
//  Y8,                                                          88
//  `Y8aaaaa,     ,adPPYba,  ,adPPYYba,  8b,dPPYba,   ,adPPYba,  88,dPPYba,
//    `"""""8b,  a8P_____88  ""     `Y8  88P'   "Y8  a8"     ""  88P'    "8a
//          `8b  8PP"""""""  ,adPPPPP88  88          8b          88       88
//  Y8a     a8P  "8b,   ,aa  88,    ,88  88          "8a,   ,aa  88       88
//   "Y88888P"    `"Ybbd8"'  `"8bbdP"Y8  88           `"Ybbd8"'  88       88


/**
 * Search for matching books.
 *
 * @param {string} term
 * @returns {Promise} Resolves to search results array.
 */
const searchBooks = (term) =>
    db.select('id', 'name', 'creationDate', 'releaseDate' , 'edition', 'writer').
        from('resources').
        innerJoin('book', 'resources.id', 'book.resource_id').
        whereRaw(`MATCH(resources.name) AGAINST ('${term}')`).
        orWhereRaw(`MATCH(book.writer) AGAINST ('${term}')`);


/**
 * Search for matching movies.
 *
 * @param {string} term
 * @returns {Promise} Resolves to search results array.
 */
const searchMovies = (term) =>
    db.select('id', 'name', 'creationDate', 'releaseDate' , 'director').
        from('resources').
        innerJoin('movie', 'resources.id', 'movie.resource_id').
        whereRaw(`MATCH(resources.name) AGAINST ('${term}')`).
        orWhereRaw(`MATCH(movie.director) AGAINST ('${term}')`);


/**
 * Search for matching resources.
 *
 * @param {string} term
 * @returns {Promise} Resolves to search results array.
 */
const searchResources = (term) =>
    Promise.
        all([searchBooks(term), searchMovies(term)]).
        then(([books, movies]) => ({ books, movies }));




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

module.exports = {
    insertUser,
    fetchUser,

    searchUsers,

    fetchFriends,
    fetchFriendshipRequests,
    insertFriendshipRequest,
    acceptFriendshipRequest,
    denyFriendshipRequest,

    insertOnWishList,
    fetchWishList,

    insertBook,
    fetchBookById,

    insertMovie,
    fetchMovieById,

    fetchComments,
    insertComment,

    searchResources,
};
