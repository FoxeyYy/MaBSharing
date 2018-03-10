/* Users table */
CREATE TABLE IF NOT EXISTS user (
  id int(5) NOT NULL AUTO_INCREMENT,
  email varchar(64) NOT NULL UNIQUE CHECK (LENGTH(email) > 0),
  password char(64) NOT NULL,
  creationDate DATE NOT NULL,
  PRIMARY KEY(id),
  FULLTEXT(email)
) ENGINE=INNODB;


/* Resources table */
CREATE TABLE IF NOT EXISTS resources (
  id int(5) NOT NULL AUTO_INCREMENT,
  name varchar(30) NOT NULL,
  creationDate DATE NOT NULL,
  releaseDate DATE NOT NULL,
  author_id int(5) NOT NULL,
  PRIMARY KEY(id),
  INDEX author_ind (author_id),
  FULLTEXT(name),
  FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB;

/* Movie table */
CREATE TABLE IF NOT EXISTS movie (
  director varchar(30) NOT NULL,
  resource_id int(5) NOT NULL,
  PRIMARY KEY(resource_id),
  INDEX resource_ind (resource_id),
  FULLTEXT(director),
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB;

/* Book table */
CREATE TABLE IF NOT EXISTS book (
  edition int(5) NOT NULL,
  writer varchar(30) NOT NULL,
  resource_id int(5) NOT NULL,
  PRIMARY KEY(resource_id),
  INDEX resource_ind (resource_id),
  FULLTEXT(writer),
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB;


/* WishList table */
CREATE TABLE IF NOT EXISTS wishlist (
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
