--
-- USERS
--

ALTER DATABASE mabsharing
  CHARACTER SET = 'utf8mb4'
  COLLATE = 'utf8mb4_bin';


--
-- USERS
--

CREATE TABLE IF NOT EXISTS user (
  id int(5) NOT NULL AUTO_INCREMENT,
  email varchar(64) NOT NULL UNIQUE CHECK (LENGTH(email) > 0),
  password char(64) NOT NULL,
  creation_date TIMESTAMP,
  PRIMARY KEY(id),
  FULLTEXT(email)
) ENGINE=INNODB;


--
-- USERS <---> USERS
--

CREATE TABLE IF NOT EXISTS friendrequest (
  creation_date TIMESTAMP NOT NULL,
  review_date TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  accepted BOOLEAN,
  orig_author_id int(5) NOT NULL,
  dest_author_id int(5) NOT NULL,
  PRIMARY KEY(creation_date, orig_author_id, dest_author_id),
  INDEX orig_author_ind (orig_author_id),
  INDEX dest_author_ind (dest_author_id),
  FOREIGN KEY (orig_author_id)
    REFERENCES user(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (dest_author_id)
    REFERENCES user(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=INNODB;


--
-- RESOURCES
--

CREATE TABLE IF NOT EXISTS resources (
  id int(5) NOT NULL AUTO_INCREMENT,
  name varchar(30) NOT NULL,
  creation_date TIMESTAMP,
  release_date DATE NOT NULL,
  author_id int(5) NOT NULL,
  PRIMARY KEY(id),
  INDEX author_ind (author_id),
  FULLTEXT(name),
  FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS movie (
  director varchar(30) NOT NULL,
  resource_id int(5) NOT NULL,
  PRIMARY KEY(resource_id),
  INDEX resource_ind (resource_id),
  FULLTEXT(director),
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS book (
  edition int(5) NOT NULL,
  writer varchar(30) NOT NULL,
  resource_id int(5) NOT NULL,
  PRIMARY KEY(resource_id),
  INDEX resource_ind (resource_id),
  FULLTEXT(writer),
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS comment (
  creation_date TIMESTAMP,
  author_id int(5) NOT NULL,
  resource_id int(5) NOT NULL,
  comment varchar(1024) NOT NULL,
  PRIMARY KEY(creation_date, author_id, resource_id),
  INDEX author_ind (author_id),
  INDEX resource_ind (resource_id),
  FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB;


--
-- USERS <---> RESOURCES
--

CREATE TABLE IF NOT EXISTS wishlist (
  author_id int(5) NOT NULL,
  resource_id int(5) NOT NULL,
  last_modified TIMESTAMP,
  PRIMARY KEY(author_id, resource_id),
  INDEX author_ind (author_id),
  INDEX resource_ind (resource_id),
  FOREIGN KEY (author_id)
    REFERENCES user(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (resource_id)
    REFERENCES resources(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS marked (
  author_id int(5) NOT NULL,
  resource_id int(5) NOT NULL,
  last_modified TIMESTAMP,
  PRIMARY KEY(author_id, resource_id),
  INDEX author_ind (author_id),
  INDEX resource_ind (resource_id),
  FOREIGN KEY (author_id)
    REFERENCES user(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (resource_id)
    REFERENCES resources(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS rating (
  like_it boolean NOT NULL,
  last_modified TIMESTAMP,
  author_id int(5) NOT NULL,
  resource_id int(5) NOT NULL,
  PRIMARY KEY(author_id, resource_id),
  INDEX author_ind (author_id),
  INDEX resource_ind (resource_id),
  FOREIGN KEY (author_id)
    REFERENCES user(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (resource_id)
    REFERENCES resources(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=INNODB;
