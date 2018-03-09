/* Users */
INSERT INTO
    user (id, email, password, creationDate)
VALUES
    (1, 'hector@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07'),
    (2, 'raul@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07'),
    (3, 'javier@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07'),
    (4, 'cesar@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07'),
    (5, 'senmao@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07'),
    (6, 'michal@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07');

/* Resources */
INSERT INTO
    resources (id, name, creationDate, releaseDate, author_id)
VALUES
    (1, 'Blade Runnner 2049', '2018-03-07', '2017-10-06', 1),
    (2, 'Inception', '2018-03-07', '2010-07-16', 4),
    (3, 'Citizen Ken', '2018-03-07', '1941-09-04', 3),
    (4, 'The Godfather', '2018-03-07', '1972-03-11', 2),
    (5, 'Moonlight', '2018-03-07', '2016-10-21', 4),
    (6, 'Manchester by the sea', '2018-03-07', '2016-11-18', 1),
    (7, 'True Fiction', '2018-03-07', '2018-04-01', 5),
    (8, 'Hell''s Princess', '2018-03-07', '2018-04-01', 6),
    (9, 'The lord of the rings', '2018-03-07', '1954-07-24', 6);

INSERT INTO
    movie (director, resource_id)
VALUES
    ('Denis Villeneuve', 1),
    ('Christopher Nolan', 2),
    ('Orson Welles', 3),
    ('Francis Ford Coppola', 4),
    ('Barry Jenkins', 5),
    ('Kenneth Lonergan', 6);

INSERT INTO
    book (edition, writer, resource_id)
VALUES
    (3, 'Lee Goldberg', 7),
    (5, 'Harold Schechter', 8),
    (1, 'J. R. R. Tolkien', 9);

INSERT INTO
    wishlist (author_id, resource_id)
VALUES
    (1, 1),
    (1, 6),
    (1, 8),
    (2, 7),
    (2, 8),
    (4, 9),
    (5, 2),
    (5, 5),
    (6, 7);
