INSERT INTO user (email, password, creationDate)
VALUES
    ('hector', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07'),
    ('raul', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07'),
    ('javier', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07'),
    ('cesar', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07'),
    ('senmao', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07'),
    ('michal', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-03-07');

INSERT INTO resources (name, creationDate, releaseDate, author_id)
VALUES
    ( 'Blade Runnner 2049', '2018-03-07', '2017-10-06', 1),
    ( 'Inception', '2018-03-07', '2010-07-16', 4),
    ( 'Citizen Ken', '2018-03-07', '1941-09-04', 3),
    ( 'The Godfather', '2018-03-07', '1972-03-11', 2),
    ( 'Moonlight', '2018-03-07', '2016-10-21', 4),
    ( 'Manchester by the sea', '2018-03-07', '2016-11-18', 1),
    ( 'True Fiction', '2018-03-07', '2018-04-01', 5),
    ( 'Hell''s Princess', '2018-03-07', '2018-04-01', 6),
    ( 'The lord of the rings', '2018-03-07', '1954-07-24', 6);

INSERT INTO movie
VALUES
    ('Denis Villeneuve', 1),
    ('Christopher Nolan', 2),
    ('Orson Welles', 3),
    ('Francis Ford Coppola', 4),
    ('Barry Jenkins', 5),
    ('Kenneth Lonergan', 6);

INSERT INTO book
VALUES
    (3, 'Lee Goldberg', 7),
    (5, 'Harold Schechter', 8),
    (1, 'J. R. R. Tolkien', 9);
