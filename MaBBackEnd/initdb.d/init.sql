/* Users table */
CREATE TABLE IF NOT EXISTS user (
  id int(5) NOT NULL AUTO_INCREMENT,
  email varchar(64) NOT NULL UNIQUE CHECK (LENGTH(email) > 0),
  password varchar(64) NOT NULL,
  creationDate DATE NOT NULL,
  PRIMARY KEY(id)
) ENGINE=INNODB;


/* Resources table */
CREATE TABLE IF NOT EXISTS resources (
  id int(5) NOT NULL AUTO_INCREMENT,
  name varchar(10) NOT NULL,
  creationDate DATE NOT NULL,
  releaseDate DATE NOT NULL,
  author_id int(5) NOT NULL,
  PRIMARY KEY(id),
  INDEX author_ind (author_id),
  FOREIGN KEY (author_id)
    REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB

/* Book table */
CREATE TABLE IF NOT EXISTS book (
  id int(5) NOT NULL AUTO_INCREMENT,
  edition int(5) NOT NULL,
  writer varchar(30) NOT NULL,
  resource_id int(5) NOT NULL,
  PRIMARY KEY(id),
  INDEX resource_ind (resource_id),
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB

/* Movie table */
CREATE TABLE IF NOT EXISTS movie (
  id int(5) NOT NULL AUTO_INCREMENT,
  director varchar(30) NOT NULL,
  resource_id int(5) NOT NULL,
  PRIMARY KEY(id),
  INDEX resource_ind (resource_id),
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB;
