# MaBSharing Back End API

## Authentication routes

Routes to sign up new users and log in already registered ones.

### POST `/signup` Register a new user

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
