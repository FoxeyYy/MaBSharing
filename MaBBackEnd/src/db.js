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
 * Fetches an user from the database given its id and its friendship
 * status with a user given the its email address.
 *
 * @param {number} userID
 * @param {string} userEmail
 *
 * @returns {object} Matching user.
 */
const fetchUserById = (userID, userEmail) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db.column(
                        'id',
                        'email',
                        { 'user_creation_date': 'user.creation_date' },
                        { 'friendrequest_creation_date': 'friendrequest.creation_date' },
                        { 'friendrequest_review_date': 'friendrequest.review_date' },
                        { 'friendrequest_accepted': 'friendrequest.accepted' },
                        { 'friendrequest_orig_author_id': 'friendrequest.orig_author_id' },
                        { 'friendrequest_dest_author_id': 'friendrequest.dest_author_id' }).
                    select().
                    from('user').
                    leftOuterJoin(
                        'friendrequest',
                        function ()
                        {
                            this.
                                on(db.raw('friendrequest.orig_author_id = user.id AND friendrequest.dest_author_id = ?', user.id)).
                                orOn(db.raw('friendrequest.orig_author_id = ? AND friendrequest.dest_author_id = user.id', user.id));
                        }).
                    where('user.id', userID)).
                    then(
                        (rows) =>
                            rows[0] ?
                                rows[0] :
                                {});


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
            });
};


/**
 * Search for matching users.
 *
 * @param {string} term
 * @returns {Promise} Resolves to search results array.
 */
const searchUsers = (term) =>
    db.select('id', 'email', 'creation_date').
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
                    select('friendrequest.orig_author_id', 'friendrequest.creation_date', 'user.email').
                    innerJoin('user', 'friendrequest.orig_author_id', 'user.id').
                    whereNull('accepted').
                    andWhere('friendrequest.dest_author_id', '=', user.id));


/**
 * Returns whether there is already a friendship request between the
 * given users.
 *
 * @param {number} origAuthorID
 * @param {number} destAuthorID
 *
 * @returns (boolean) True if there is already a friendship request.
 */
const crossedFriendshipRequest = (origAuthorID, destAuthorID) =>
    db('friendrequest').
        select('*').
        whereNull('accepted').
        andWhere('orig_author_id', '=', origAuthorID).
        andWhere('dest_author_id', '=', destAuthorID).
        then((rows) => (rows.length > 0));


/**
 * Returns whether there is already a friendship request between the
 * given users.
 *
 * @param {number} origAuthorID
 * @param {number} destAuthorID
 *
 * @returns (boolean) True if there is already a friendship request.
 */
const existsFriendshipRequest = (origAuthorID, destAuthorID) =>
    db('friendrequest').
        select('*').
        whereNull('accepted').
        andWhere('orig_author_id', '=', origAuthorID).
        andWhere('dest_author_id', '=', destAuthorID).
        then((rows) => (rows.length > 0));


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
                Promise.all(
                    [
                        user,
                        crossedFriendshipRequest(destUserID, user.id),
                        existsFriendshipRequest(user.id, destUserID),
                    ])).
        then(
            ([user, crossedRequest, previousRequest]) =>
                (crossedRequest) ?
                    Promise.reject('Crossed friendship request') :
                    (previousRequest) ?
                        Promise.reject('Previous friendship request') :
                        db('friendrequest').
                            insert(
                                {
                                    creation_date: new Date().toISOString().split('T')[0],
                                    accepted: null,
                                    orig_author_id: user.id,
                                    dest_author_id: destUserID,
                                })).
        then(() => destUserID);


const acceptFriendshipRequest = (userEmail, origUserID) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('friendrequest').
                    whereNull('accepted').
                    andWhere('orig_author_id', '=', origUserID).
                    andWhere('dest_author_id', '=', user.id).
                    update(
                        {
                            accepted: 1,
                        })).
        then(() => origUserID);


const denyFriendshipRequest = (userEmail, origUserID) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('friendrequest').
                    whereNull('accepted').
                    andWhere('orig_author_id', '=', origUserID).
                    andWhere('dest_author_id', '=', user.id).
                    update(
                        {
                            accepted: 0,
                        })).
        then(() => origUserID);


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
        select('resource_id', 'name', 'release_date', 'edition', 'writer').
        innerJoin('book', 'resources.id', 'book.resource_id').
        where('resources.id', 'in', fetchResourcesOnWishList(userID));

/**
 * Returns the movies in a user wish list.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to movies on wish list.
 */
const fetchMoviesOnWishList = (userID) =>
    db.from('resources').
        select('resource_id', 'name', 'release_date', 'director').
        innerJoin('movie', 'resources.id', 'movie.resource_id').
        where('resources.id', 'in', fetchResourcesOnWishList(userID));

/**
 * Returns the wish list of user identified by the given email address.
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
                    then(
                        () =>
                        {
                            return resourceID
                        }));


/**
 * Deletes a resource from a user wishlist.
 *
 * @param {string} userEmail
 * @param {number} resourceID
 *
 * @returns {Promise<number>} Item id of deleted resource.
 */
const deleteFromWishList = (userEmail, resourceID) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('wishlist').
                    where('author_id', user.id).
                    andWhere('resource_id', resourceID).
                    del().
                    then(
                        () =>
                        {
                            return resourceID
                        }));


/**
 * Returns the resources ids marked as read/seen by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to the resources ids.
 */
const fetchResourcesMarked = (userID) =>
    db('marked').select('resource_id').where('author_id', '=', userID);

/**
 * Returns the books read by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to books read.
 */
const fetchBooksRead = (userID) =>
    db.from('resources').
        select('resource_id', 'name', 'release_date', 'edition', 'writer').
        innerJoin('book', 'resources.id', 'book.resource_id').
        where('resources.id', 'in', fetchResourcesMarked(userID));

/**
 * Returns the movies seen by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to the movies seen.
 */
const fetchMoviesSeen = (userID) =>
    db.from('resources').
        select('resource_id', 'name', 'release_date', 'director').
        innerJoin('movie', 'resources.id', 'movie.resource_id').
        where('resources.id', 'in', fetchResourcesMarked(userID));


/**
 * Returns the books read / movies seen of user identified by the given
 * email address.
 *
 * @param {string} userEmail
 * @returns {Promise<Array>} Resolves to the user marked list.
 */
const fetchMarkedList = (userEmail) =>
    fetchUser(userEmail).
        then(
            (user) =>
                Promise.all(
                    [
                        fetchBooksRead(user.id),
                        fetchMoviesSeen(user.id),
                    ])).
        then(
            ([books, movies]) => ({ books, movies }));


/**
 * Inserts a new item on a user marked list.
 *
 * @param {string} userEmail
 * @param {number} resourceID
 *
 * @returns {Promise<number>} Item id on the marked list.
 */
const insertOnMarkedList = (userEmail, resourceID) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('marked').
                    insert(
                        {
                            author_id: user.id,
                            resource_id: resourceID,
                        }).
                    then(() => resourceID));


/**
 * Deletes a resource from a user marked list.
 *
 * @param {string} userEmail
 * @param {number} resourceID
 *
 * @returns {Promise<number>} Item id of deleted resource.
 */
const deleteFromMarkedList = (userEmail, resourceID) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('marked').
                    where('author_id', user.id).
                    andWhere('resource_id', resourceID).
                    del().
                    then(() => resourceID ));


/**
 * Returns the resources ids disliked by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to the resources ids.
 */
const fetchResourcesDisliked = (userID) =>
    db('rating').
        select('resource_id').
        where('author_id', '=', userID).
        andWhere('like_it', '=', '0');

/**
 * Returns the resources ids liked by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to the resources ids.
 */
const fetchResourcesLiked = (userID) =>
    db('rating').
        select('resource_id').
        where('author_id', '=', userID).
        andWhere('like_it', '=', '1');

/**
 * Returns the books disliked by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to the books liked.
 */
const fetchBooksDisliked = (userID) =>
    db.from('resources').
        select('resource_id', 'name', 'release_date', 'edition', 'writer').
        innerJoin('book', 'resources.id', 'book.resource_id').
        where('resources.id', 'in', fetchResourcesDisliked(userID));

/**
 * Returns the books liked by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to the books liked.
 */
const fetchBooksLiked = (userID) =>
    db.from('resources').
        select('resource_id', 'name', 'release_date', 'edition', 'writer').
        innerJoin('book', 'resources.id', 'book.resource_id').
        where('resources.id', 'in', fetchResourcesLiked(userID));

/**
 * Returns the books read by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to books read.
 */
const fetchBooksRated = (userID) =>
    Promise.
        all(
            [
                fetchBooksDisliked(userID),
                fetchBooksLiked(userID),
            ]).
        then(([disliked, liked]) => ({ disliked, liked }));

/**
 * Returns the movies disliked by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to the movies liked.
 */
const fetchMoviesDisliked = (userID) =>
    db.from('resources').
        select('resource_id', 'name', 'release_date', 'director').
        innerJoin('movie', 'resources.id', 'movie.resource_id').
        where('resources.id', 'in', fetchResourcesDisliked(userID));

/**
 * Returns the movies liked by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to the movies liked.
 */
const fetchMoviesLiked = (userID) =>
    db.from('resources').
        select('resource_id', 'name', 'release_date', 'director').
        innerJoin('movie', 'resources.id', 'movie.resource_id').
        where('resources.id', 'in', fetchResourcesLiked(userID));

/**
 * Returns the movies read by a user.
 *
 * @param {number} userID
 * @returns {Promise<array>} Resolves to movies read.
 */
const fetchMoviesRated = (userID) =>
    Promise.
        all(
            [
                fetchMoviesDisliked(userID),
                fetchMoviesLiked(userID),
            ]).
        then(([disliked, liked]) => ({ disliked, liked }));

/**
 * Returns the resources rated by a user identified by the given email
 * address.
 *
 * @param {string} userEmail
 * @returns {Promise<Array>} Resolves to the user rated list.
 */
const fetchRatedList = (userEmail) =>
    fetchUser(userEmail).
        then(
            (user) =>
                Promise.all(
                    [
                        fetchBooksRated(user.id),
                        fetchMoviesRated(user.id),
                    ])).
        then(
            ([books, movies]) => ({ books, movies }));


/**
 * Inserts a new item on a user rated list.
 *
 * @param {string} userEmail
 * @param {number} resourceID
 * @param {boolean} liked
 *
 * @returns {Promise<number>} Item id on the rated list.
 */
const insertOnRatedList = (userEmail, resourceID, liked) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('rating').
                    insert(
                        {
                            like_it: (liked) ? 1 : 0,
                            author_id: user.id,
                            resource_id: resourceID,
                        }).
                    then(() => resourceID));


/**
 * Updates a rating from a user given its email address.
 *
 * @param {string} userEmail
 * @param {number} resourceID
 * @param {boolean} liked
 *
 * @returns {Promise<number>} Item id on the rated list.
 */
const updateRating = (userEmail, resourceID, liked) =>
    fetchUser(userEmail).
        then(
            (user) =>
                db('rating').
                    andWhere('author_id', '=', user.id).
                    andWhere('resource_id', '=', resourceID).
                    update(
                        {
                            like_it: (liked) ? 1 : 0,
                        })).
        then(() => resourceID);


/**
 * Fetch a resouce by its id.
 *
 * @param {number} resourceId
 * @returns {object} Matching resource info.
 */
const fetchResourceById = (resourceId) =>
    Promise.
        all(
            [
                selectBookById(resourceId),
                selectMovieById(resourceId),
            ]).
        then(
            ([book, movie]) =>
                book.id ?
                    Object.assign({ resource_type: "book" }, book) :
                    movie.id ?
                        Object.assign({ resource_type: "movie" }, movie) :
                        {});


/**
 * Size in days of the time window used to consider an event as recent.
 *
 * @constant
 * @type {number}
 */
const TIME_WINDOW = 30;


/**
 * Returns the comments recently posted by a user given its id.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent comments sorted by date.
 */
const fetchUserRecentComments = (userID, timeWindow=TIME_WINDOW) =>
    db.from('comment').
        where('author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), creation_date) < ?', [timeWindow]).
        orderBy('creation_date').
        then(
            (comments) =>
            {
                const selections =
                    comments.
                        map(comment => comment.resource_id).
                        reduce(
                            (acc, id) =>
                            {
                                acc.push(fetchResourceById(id));
                                return acc;
                            },
                            []);
                return Promise.all([comments, ...selections]);
            }).
        then(
            ([comments, ...selections]) =>
            {
                selections.forEach(resource => delete resource.id);
                const joined =
                    comments.reduce(
                        (acc, item) =>
                        {
                            const match = selections.filter(resource => resource.resource_id === item.resource_id)[0];
                            match["resource_creation_date"] = match.creation_date;
                            acc.push(Object.assign(match, item));
                            return acc;
                        },
                        []);
                return joined;
            });


/**
 * Returns the ratings recently made by a user given its id.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent ratings sorted by date.
 */
const fetchUserRecentRatings = (userID, timeWindow=TIME_WINDOW) =>
    db.from('rating').
        where('author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), last_modified) < ?', [timeWindow]).
        orderBy('last_modified').
        then(
            (ratings) =>
            {
                const selections =
                    ratings.
                        map(comment => comment.resource_id).
                        reduce(
                            (acc, id) =>
                            {
                                acc.push(fetchResourceById(id));
                                return acc;
                            },
                            []);
                return Promise.all([ratings, ...selections]);
            }).
        then(
            ([ratings, ...selections]) =>
            {
                selections.forEach(resource => delete resource.id);
                const joined =
                    ratings.reduce(
                        (acc, item) =>
                        {
                            const match = selections.filter(resource => resource.resource_id === item.resource_id)[0];
                            match["resource_creation_date"] = match.creation_date;
                            acc.push(Object.assign(match, item));
                            return acc;
                        },
                        []);
                return joined;
            });


/**
 * Returns the friendship requests made recently to a user given its id.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent friendship requests sorted by date.
 */
const fetchUserRecentFriendshipRequestsReceived = (userID, timeWindow=TIME_WINDOW) =>
    db.from('friendrequest').
        whereNull('accepted').
        andWhere('dest_author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), creation_date) < ?', [timeWindow]).
        orderBy('creation_date');


/**
 * Returns the friendship requests accepted recently by a user given its id.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent accepted friendships sorted by date.
 */
const fetchUserRecentAcceptedFriendshipsReceived = (userID, timeWindow=TIME_WINDOW) =>
    db.from('friendrequest').
        where('accepted', '=', '1').
        andWhere('dest_author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), creation_date) < ?', [timeWindow]).
        orderBy('creation_date');


/**
 * Returns the friendship requests rejected recently by a user given its id.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent rejected friendships sorted by date.
 */
const fetchUserRecentRejectedFriendshipsReceived = (userID, timeWindow=TIME_WINDOW) =>
    db.from('friendrequest').
        where('accepted', '=', '0').
        andWhere('dest_author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), creation_date) < ?', [timeWindow]).
        orderBy('creation_date');


/**
 * Returns the friendship requests made recently by a user given its id.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent friendship requests sorted by date.
 */
const fetchUserRecentFriendshipRequestsSent = (userID, timeWindow=TIME_WINDOW) =>
    db.from('friendrequest').
        whereNull('accepted').
        andWhere('orig_author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), creation_date) < ?', [timeWindow]).
        orderBy('creation_date');


/**
 * Returns the friendship requests sent recently by a user given its id
 * and accepted by the recipient.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent accepted friendships sorted by date.
 */
const fetchUserRecentAcceptedFriendshipsSent = (userID, timeWindow=TIME_WINDOW) =>
    db.from('friendrequest').
        where('accepted', '=', '1').
        andWhere('orig_author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), creation_date) < ?', [timeWindow]).
        orderBy('creation_date');

/**
 * Returns the friendship requests sent recently by a user given its id
 * and rejected by the recipient.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent rejected friendships sorted by date.
 */
const fetchUserRecentRejectedFriendshipsSent = (userID, timeWindow=TIME_WINDOW) =>
    db.from('friendrequest').
        where('accepted', '=', '0').
        andWhere('orig_author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), creation_date) < ?', [timeWindow]).
        orderBy('creation_date');


/**
 * Returns the resources marked as seen/read recently by a user given
 * its id.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent marked resources sorted by date.
 */
const fetchUserRecentMarkedResources = (userID, timeWindow=TIME_WINDOW) =>
    db.from('marked').
        where('author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), last_modified) < ?', [timeWindow]).
        orderBy('last_modified').
        then(
            (marked) =>
            {
                const selections =
                    marked.
                        map(comment => comment.resource_id).
                        reduce(
                            (acc, id) =>
                            {
                                acc.push(fetchResourceById(id));
                                return acc;
                            },
                            []);
                return Promise.all([marked, ...selections]);
            }).
        then(
            ([marked, ...selections]) =>
            {
                selections.forEach(resource => delete resource.id);
                const joined =
                    marked.reduce(
                        (acc, item) =>
                        {
                            const match = selections.filter(resource => resource.resource_id === item.resource_id)[0];
                            match["resource_creation_date"] = match.creation_date;
                            acc.push(Object.assign(match, item));
                            return acc;
                        },
                        []);
                return joined;
            });


/**
 * Returns the resources added recently to the wish list by a user given
 * its id.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent resources added to the with list sorted by date.
 */
const fetchUserRecentResourcesOnWishlist = (userID, timeWindow=TIME_WINDOW) =>
    db.from('wishlist').
        where('author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), last_modified) < ?', [timeWindow]).
        orderBy('last_modified').
        then(
            (wishlist) =>
            {
                const selections =
                    wishlist.
                        map(comment => comment.resource_id).
                        reduce(
                            (acc, id) =>
                            {
                                acc.push(fetchResourceById(id));
                                return acc;
                            },
                            []);
                return Promise.all([wishlist, ...selections]);
            }).
        then(
            ([wishlist, ...selections]) =>
            {
                selections.forEach(resource => delete resource.id);
                const joined =
                    wishlist.reduce(
                        (acc, item) =>
                        {
                            const match = selections.filter(resource => resource.resource_id === item.resource_id)[0];
                            match["resource_creation_date"] = match.creation_date;
                            acc.push(Object.assign(match, item));
                            return acc;
                        },
                        []);
                return joined;
            });


/**
 * Returns the new resources recently added by a user given its id.
 *
 * @param {number} userID
 * @param {number} timeWindow
 *
 * @returns {Promise<array>} Recent new resources sorted by date.
 */
const fetchUserRecentNewResources = (userID, timeWindow=TIME_WINDOW) =>
    db.from('resources').
        where('author_id', '=', userID).
        andWhereRaw('DATEDIFF(NOW(), creation_date) < ?', [timeWindow]).
        orderBy('creation_date').
        then(
            (newResources) =>
            {
                const selections =
                    newResources.
                        map(resource => resource.id).
                        reduce(
                            (acc, id) =>
                            {
                                acc.push(fetchResourceById(id));
                                return acc;
                            },
                            []);
                return Promise.all(selections);
            }).
        then(
            (selections) =>
            {
                // const joined =
                //     newResources.reduce(
                //         (acc, item) =>
                //         {
                //             const match = selections.filter(resource => resource.resource_id === item.resource_id)[0];
                //             match["resource_creation_date"] = match.creation_date;
                //             acc.push(Object.assign(match, item));
                //             return acc;
                //         },
                //         []);
                // return joined;
                selections.forEach(resource => delete resource.id);
                return selections;
            });

/**
 * Returns the recent events related to a user given its ID as an array
 * sorted by the timestamp of the event.
 *
 * The events returned are:
 *
 *   - New comments
 *   - New ratings
 *   - Friendship requests made to the user
 *   - Friendship requests accepted by the user
 *   - Friendship requests rejected by the user
 *   - Friendship requests made by the user
 *   - Friendship requests from the user accepted by the recipient
 *   - Friendship requests from the user rejected by the recipient
 *   - Resources marked as seen
 *   - Resources added to the whish list
 *
 * @param {number} userID
 * @returns {Promise<array>} Events related to a user given its ID.
 */
const fetchEventsByUserID = (userID) =>
{
    return Promise.
        all(
            [
                fetchUserRecentComments(userID),
                fetchUserRecentRatings(userID),
                fetchUserRecentFriendshipRequestsReceived(userID),
                fetchUserRecentAcceptedFriendshipsReceived(userID),
                fetchUserRecentRejectedFriendshipsReceived(userID),
                fetchUserRecentFriendshipRequestsSent(userID),
                fetchUserRecentAcceptedFriendshipsSent(userID),
                fetchUserRecentRejectedFriendshipsSent(userID),
                fetchUserRecentMarkedResources(userID),
                fetchUserRecentResourcesOnWishlist(userID),
                fetchUserRecentNewResources(userID),
            ]).
        then(
            (
                [
                    comments,
                    ratings,
                    friendshipRequestsReceived,
                    acceptedFriendshipsReceived,
                    rejectedFriendshipsReceived,
                    friendshipRequestsSent,
                    acceptedFriendshipsSent,
                    rejectedFriendshipsSent,
                    marked,
                    wishlist,
                    newResources,
                ]) =>
            {
                const events =
                    Array.prototype.
                        concat(
                            comments.map(e => Object.assign(e, { 'event': 'comment', 'timestamp': e['creation_date'] })),
                            ratings.map(e => Object.assign(e, { 'event': 'rating', 'timestamp': e['last_modified'] })),
                            friendshipRequestsReceived.map(e => Object.assign(e, { 'event': 'friendship_request_received', 'timestamp': e['creation_date'] })),
                            acceptedFriendshipsReceived.map(e => Object.assign(e, { 'event': 'accepted_friendship_received', 'timestamp': e['review_date'] })),
                            rejectedFriendshipsReceived.map(e => Object.assign(e, { 'event': 'rejected_friendship_received', 'timestamp': e['review_date'] })),
                            friendshipRequestsSent.map(e => Object.assign(e, { 'event': 'friendship_request_sent', 'timestamp': e['creation_date'] })),
                            acceptedFriendshipsSent.map(e => Object.assign(e, { 'event': 'accepted_friendship_sent', 'timestamp': e['review_date'] })),
                            rejectedFriendshipsSent.map(e => Object.assign(e, { 'event': 'rejected_friendship_sent', 'timestamp': e['review_date'] })),
                            marked.map(e => Object.assign(e, { 'event': 'marked', 'timestamp': e['last_modified'] })),
                            wishlist.map(e => Object.assign(e, { 'event': 'wishlist', 'timestamp': e['last_modified'] })),
                            newResources.map(e => Object.assign(e, { 'event': 'new_resource', 'timestamp': e['creation_date'] })),
                        ).
                        sort((a, b) => a['timestamp'] < b['timestamp'] ? -1 : 1);
                return events;
            });
};


/**
 * Returns the recent events related to the friends of a user given its
 * email address.
 *
 * The events are returned as a map with the key being the user id and
 * the value the events as an array sorted by the timestamp of the
 * event.
 *
 * The events returned are:
 *
 *   - New comments
 *   - New ratings
 *   - Friendship requests made to the user
 *   - Friendship requests accepted by the user
 *   - Friendship requests rejected by the user
 *   - Friendship requests made by the user
 *   - Friendship requests from the user accepted by the recipient
 *   - Friendship requests from the user rejected by the recipient
 *   - Resources marked as seen
 *   - Resources added to the whish list
 *
 * @param {number} userID
 * @returns {Promise<object>} Events related to the friends a user given its email address.
 */
const fetchFriendsEvents = (userEmail) =>
    fetchFriends(userEmail).
        then(
            (friends) =>
            {
                return Promise.all([friends].concat(friends.map(fetchEventsByUserID)));
            }).
            then(
                (result) =>
                {
                    const ids = result[0];
                    const events = result.slice(1);
                    // return result[0].reduce(
                    //     (acc, friend_id, idx) =>
                    //     {
                    //         return Object.assign(
                    //             acc,
                    //             {
                    //                 [friend_id]: events[idx],
                    //             });
                    //     },
                    //     {});
                    return result[0].reduce(
                        (acc, friend_id, idx) =>
                        {
                            const updated = events[idx].reduce(
                                (acc, event) =>
                                {
                                    acc.push(
                                        Object.assign(
                                            { friend_id },
                                            event));
                                    return acc;
                                },
                                []);
                            return acc.concat(updated);
                        },
                        []);
                });




//  88888888ba
//  88      "8b
//  88      ,8P
//  88aaaaaa8P'  ,adPPYba,  ,adPPYba,   ,adPPYba,   88       88  8b,dPPYba,   ,adPPYba,   ,adPPYba,  ,adPPYba,
//  88""""88'   a8P_____88  I8[    ""  a8"     "8a  88       88  88P'   "Y8  a8"     ""  a8P_____88  I8[    ""
//  88    `8b   8PP"""""""   `"Y8ba,   8b       d8  88       88  88          8b          8PP"""""""   `"Y8ba,
//  88     `8b  "8b,   ,aa  aa    ]8I  "8a,   ,a8"  "8a,   ,a88  88          "8a,   ,aa  "8b,   ,aa  aa    ]8I
//  88      `8b  `"Ybbd8"'  `"YbbdP"'   `"YbbdP"'    `"YbbdP'Y8  88           `"Ybbd8"'   `"Ybbd8"'  `"YbbdP"'


/**
 * Select a rating given the ID of the rated resource and the ID of the
 * user who rated the resource.
 *
 * @param {number} resourceID
 * @param {number} authorID
 *
 * @return {object} Rating.
 */
const selectRating = (resourceID, authorID) =>
    db.from('rating').
        column('like_it', { 'rating_last_modified': 'last_modified' }).
        where('resource_id', resourceID).
        andWhere('author_id', authorID).
        then(
            (rows) =>
                rows[0] ?
                    rows[0] :
                    { like_it: null, rating_last_modified: null });


/**
 * Select whether a resource is marked given the ID of the marked
 * resource and the ID of the user who marked the resource.
 *
 * @param {number} resourceID
 * @param {number} authorID
 *
 * @return {object} Mark.
 */
const selectMark = (resourceID, authorID) =>
db.from('marked').
    column({ 'mark_last_modified': 'last_modified' }).
    where('resource_id', resourceID).
    andWhere('author_id', authorID).
    then(
        (rows) =>
            rows[0] ?
                Object.assign({ marked: true }, rows[0]) :
                { marked: false, marked_last_modified: null });


/**
 * Select whether a resource is on the wish list of a user given the ID
 * of the resource and the ID of the user.
 *
 * @param {number} resourceID
 * @param {number} authorID
 *
 * @return {object} Is on the wish list?.
 */
const selectWishlist = (resourceID, authorID) =>
db.from('wishlist').
    column({ 'wishlist_last_modified': 'last_modified' }).
    where('resource_id', resourceID).
    andWhere('author_id', authorID).
    then(
        (rows) =>
            rows[0] ?
                Object.assign({ on_wishlist: true }, rows[0]) :
                { on_wishlist: false, wishlist_last_modified: null });


/**
 * Select a book from the database given its id.
 *
 * @param {number} resourceID
 * @returns {object} Matching book.
 */
const selectBookById = (resourceID) =>
    db.from('resources').
        where('id', resourceID).
        innerJoin('book', 'resources.id', 'book.resource_id').
        then((rows) => rows[0] ? rows[0] : {});


/**
 * Fetch a book from the database given its id together with its
 * information related to a user given its email address.
 *
 * @param {number} resourceID
 * @param {string} userEmail
 *
 * @returns {object} Matching book and info.
 */
const fetchBookById = (resourceID, userEmail) =>
    fetchUser(userEmail).
        then(
            (user) =>
                Promise.all(
                    [
                        selectBookById(resourceID),
                        selectRating(resourceID, user.id),
                        selectMark(resourceID, user.id),
                        selectWishlist(resourceID, user.id),
                    ])).
        then((result) => Object.assign(...result));


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
    let resource_id;

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
                                    release_date: releaseDate,
                                    author_id: user.id,
                                }).
                            into('resources').
                            then(
                                (ids) =>
                                {
                                    resource_id = ids[0];
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
                    then(() => resource_id);
            });
};


/**
 * Select a movie from the database given its id.
 *
 * @param {number} resourceID
 * @returns {object} Matching movie.
 */
const selectMovieById = (resourceID) =>
    db.from('resources').
        where('id', resourceID).
        innerJoin('movie', 'resources.id', 'movie.resource_id').
        then((rows) => rows[0] ? rows[0] : {});


/**
 * Fetch a movie from the database given its id together with its
 * information related to a user given its email address.
 *
 * @param {number} resourceID
 * @param {string} userEmail
 *
 * @returns {object} Matching movie and info.
 */
const fetchMovieById = (resourceID, userEmail) =>
    fetchUser(userEmail).
        then(
            (user) =>
                Promise.all(
                    [
                        selectMovieById(resourceID),
                        selectRating(resourceID, user.id),
                        selectMark(resourceID, user.id),
                        selectWishlist(resourceID, user.id),
                    ])).
        then((result) => Object.assign(...result));


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
    let resource_id;

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
                                    release_date: releaseDate,
                                    author_id: user.id,
                                }).
                            into('resources').
                            then(
                                (ids) =>
                                {
                                    resource_id = ids[0];

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
                    then(() => resource_id);
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
                            author_id: user.id,
                            resource_id: resourceID,
                            comment,
                        }).
                    then(() => resourceID));


/**
 * Fetches the ratings make about a resource.
 *
 * @param {number} resourceID
 * @returns {Promise<Array>} Ratings.
 */
const fetchRatings = (resourceID) =>
    db.from('rating').where('resource_id', '=', resourceID);




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
    db.select('id', 'name', 'creation_date', 'release_date' , 'edition', 'writer').
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
    db.select('id', 'name', 'creation_date', 'release_date' , 'director').
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
    fetchUserById,
    fetchUser,

    searchUsers,

    fetchEventsByUserID,
    fetchFriendsEvents,

    fetchFriends,
    fetchFriendshipRequests,
    insertFriendshipRequest,
    acceptFriendshipRequest,
    denyFriendshipRequest,

    insertOnWishList,
    fetchWishList,
    deleteFromWishList,

    insertOnMarkedList,
    fetchMarkedList,
    deleteFromMarkedList,

    fetchRatedList,
    insertOnRatedList,
    updateRating,

    insertBook,
    fetchBookById,

    insertMovie,
    fetchMovieById,

    fetchComments,
    insertComment,

    fetchRatings,

    searchResources,
};
