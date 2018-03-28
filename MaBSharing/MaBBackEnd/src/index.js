/**
 * MaBSharing back end entry point.
 *
 * @module src/index
 */


const winston = require('winston');

const server = require('./server');

const IN_PRODUCTION = (process.env.NODE_ENV === 'production');




//  88                                             88
//  88                                             ""
//  88
//  88          ,adPPYba,   ,adPPYb,d8  ,adPPYb,d8 88 8b,dPPYba,   ,adPPYb,d8
//  88         a8"     "8a a8"    `Y88 a8"    `Y88 88 88P'   `"8a a8"    `Y88
//  88         8b       d8 8b       88 8b       88 88 88       88 8b       88
//  88         "8a,   ,a8" "8a,   ,d88 "8a,   ,d88 88 88       88 "8a,   ,d88
//  88888888888 `"YbbdP"'   `"YbbdP"Y8  `"YbbdP"Y8 88 88       88  `"YbbdP"Y8
//                          aa,    ,88  aa,    ,88                 aa,    ,88
//                           "Y8bbdP"    "Y8bbdP"                   "Y8bbdP"


winston.configure(
    {
        transports:
        [
            new winston.transports.Console(
                {
                    level: IN_PRODUCTION ? 'info' : 'debug',
                    json: !IN_PRODUCTION,
                    colorize: !IN_PRODUCTION,
                    handleExceptions: true,
                    humanReadableUnhandledException: true,
                }),
        ],
    });




//   ad88888ba
//  d8"     "8b ,d                            ,d
//  Y8,         88                            88
//  `Y8aaaaa, MM88MMM ,adPPYYba, 8b,dPPYba, MM88MMM    88       88 8b,dPPYba,
//    `"""""8b, 88    ""     `Y8 88P'   "Y8   88       88       88 88P'    "8a
//          `8b 88    ,adPPPPP88 88           88       88       88 88       d8
//  Y8a     a8P 88,   88,    ,88 88           88,      "8a,   ,a88 88b,   ,a8"
//   "Y88888P"  "Y888 `"8bbdP"Y8 88           "Y888     `"YbbdP'Y8 88`YbbdP"'
//                                                                 88
//                                                                 88


server.app.listen(process.env.PORT);
