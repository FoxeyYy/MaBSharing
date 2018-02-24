/* Users table */
CREATE TABLE IF NOT EXISTS user (
  id int(5) NOT NULL AUTO_INCREMENT,
  email varchar(64) NOT NULL UNIQUE CHECK (LENGTH(email) > 0),
  password varchar(64) NOT NULL,
  creationDate DATE NOT NULL,
  PRIMARY KEY(id)
) ENGINE=INNODB;
