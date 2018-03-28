# MaBSharing Back End API

## Authentication routes

Routes to sign up new users and log in already registered ones.

### POST `/auth/signup` Register a new user

Register a new user on the platform given its email and password.

The email has to be unique, different from those already registered.
This requisite allows duplicate passwords for users with different email
addresses.

The details of the endpoint are;

* Produces: `application/json`

* Parameters:
    * `email`
        * in: body
        * required: true
        * type: string
    * `password`
        * in: body
        * required: true
        * type: string
* Responses:
    * `200`: Success
        * type: object
        * properties:
            * `token`: JSON Web Token
                * type: string
    * `400`: Invalid email and password
        * type: object
        * properties:
            * `error`: Message with error details
                * type: string

### POST `/auth/login` Log in a registered user

Log in a previously registered user on the platform given its email and
password.

The email and password have to match a pair already on the database.

To not leak information, attempts to log in with an email address
present in the database but an incorrect password will return an error
without indicating that the email address is in database.

The details of the endpoint are;

* Produces: `application/json`

* Parameters:
    * `email`
        * in: body
        * required: true
        * type: string
    * `password`
        * in: body
        * required: true
        * type: string
* Responses:
    * `200`: Success
        * type: object
        * properties:
            * `token`: JSON Web Token
                * type: string
    * `400`: Invalid email and password
        * type: object
        * properties:
            * `error`: Message with error details
                * type: string
