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
        innerJoin('book', 'resources.id', 'book.resource_id').
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
                            edition: rows[0].edition,
                            writer: rows[0].writer,
                        });
                }
            })
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
    return null;
};


/**
 * Inserts a new movie on the database.
 *
 * The fields needed to create a new movie are:
 *
 *   - name
 *   - releaseDate
 *   - user
 *   - director
 *
 * @param {object} movie
 * @returns {number} Identifier of the new movie on the database.
 */
const insertMovie = ({ name, releaseDate, user, director }) =>
{
    return null;
};




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

    insertBook,
    fetchBookById,
};
