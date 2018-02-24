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
            // client: "mariadb",
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
 * @returns { { email: string, password: string } }
 */
const fetchUser = (email) =>
{
    return db.
        select('email', 'password').
        from('user').
        where({ email }).
        then(
            rows =>
            {
                return rows[0];
            })
};


/**
 * Inserts a new user on the database.
 *
 * @param {string} email
 * @param {string} password
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
};
