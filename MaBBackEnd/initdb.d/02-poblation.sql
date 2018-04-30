--
-- USERS
--

INSERT INTO
    user (id, email, password, creation_date)
VALUES
    (1, 'hector@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-04-07'),
    (2, 'raul@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-04-07'),
    (3, 'javier@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-04-07'),
    (4, 'cesar@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-04-07'),
    (5, 'senmao@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-04-07'),
    (6, 'michal@email.com', '$2a$10$/fji/bbJEXWG9coxcx47jeSQPak5NySs.28W5MmV4k.B0aU2L2BGu', '2018-04-07');


--
-- USERS <---> USERS
--

INSERT INTO
    friendrequest (creation_date, review_date, accepted, orig_author_id, dest_author_id)
VALUES
    ('2018-04-07', '2018-04-07', 1, 1, 2),
    ('2018-04-08', '2018-04-09', 0, 1, 3),
    ('2018-04-08', NULL, NULL, 1, 6),
    ('2018-04-08', NULL, NULL, 2, 3),
    ('2018-04-10', NULL, NULL, 4, 1);


--
-- RESOURCES
--

INSERT INTO
    resources (id, name, creation_date, release_date, author_id)
VALUES
    (1, 'Blade Runnner 2049', '2018-04-07', '2017-10-06', 1),
    (2, 'Inception', '2018-04-07', '2010-07-16', 4),
    (3, 'Citizen Ken', '2018-04-07', '1941-09-04', 3),
    (4, 'The Godfather', '2018-04-07', '1972-03-11', 2),
    (5, 'Moonlight', '2018-04-07', '2016-10-21', 4),
    (6, 'Manchester by the sea', '2018-04-07', '2016-11-18', 1),
    (7, 'True Fiction', '2018-04-07', '2018-04-01', 5),
    (8, 'Hell''s Princess', '2018-04-07', '2018-04-01', 6),
    (9, 'The lord of the rings', '2018-04-07', '1954-07-24', 6);

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
    comment (creation_date, author_id, resource_id, comment)
VALUES
    ('2018-04-11', 1, 1, 'Let me take a nap... great atmosphere, anyway.'),
    ('2018-04-11', 2, 1, 'Immensely sleek shot.'),
    ('2018-04-13', 3, 1, 'It\'s splendid not just classic!'),
    ('2018-04-15', 2, 1, 'I think I\'m crying. It\'s that fresh.'),
    ('2018-04-11', 1, 4, 'Gorgeous. So cool.');


--
-- USERS <---> RESOURCES
--

INSERT INTO
    wishlist (author_id, resource_id, last_modified)
VALUES
    (1, 1, '2018-04-18'),
    (1, 6, '2018-04-27'),
    (1, 8, '2018-04-23'),
    (2, 7, '2018-04-22'),
    (2, 8, '2018-04-22'),
    (4, 9, '2018-04-26'),
    (5, 2, '2018-04-25'),
    (5, 5, '2018-04-25'),
    (6, 7, '2018-04-20');

INSERT INTO
    marked (author_id, resource_id, last_modified)
VALUES
    (1, 2, '2018-04-20'),
    (1, 4, '2018-04-19'),
    (1, 8, '2018-04-17'),
    (1, 9, '2018-04-22'),
    (2, 1, '2018-04-23'),
    (2, 2, '2018-04-26'),
    (3, 7, '2018-04-24'),
    (3, 8, '2018-04-23'),
    (5, 4, '2018-04-18'),
    (6, 6, '2018-04-21');

INSERT INTO
    rating (like_it, last_modified, author_id, resource_id)
VALUES
    (0, '2018-04-17', 1, 2),
    (0, '2018-04-15', 1, 3),
    (1, '2018-04-15', 1, 4),
    (1, '2018-04-19', 1, 8),
    (1, '2018-04-15', 1, 9),
    (1, '2018-04-15', 2, 1),
    (0, '2018-04-15', 2, 2),
    (0, '2018-04-17', 3, 7),
    (0, '2018-04-15', 3, 8),
    (1, '2018-04-15', 5, 4),
    (1, '2018-04-15', 6, 6);
