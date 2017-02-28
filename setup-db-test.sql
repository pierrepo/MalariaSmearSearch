DROP TABLE IF EXISTS tbl_level ;
DROP TABLE IF EXISTS tbl_user ;
DROP TABLE IF EXISTS tbl_photo ;
DROP TABLE IF EXISTS tbl_chunk ;

CREATE TABLE tbl_level (
  'name' VARCHAR(45) PRIMARY KEY
);

INSERT INTO tbl_level(level_name) VALUES ('technician');
INSERT INTO tbl_level(level_name) VALUES ('supervisor');

CREATE TABLE tbl_user (

  'username' VARCHAR(45) PRIMARY KEY ,
  'email' VARCHAR(45) NULL,
  'password' VARCHAR(45) NULL,
  'level' DEFAULT 'technician' REFERENCES tbl_level(name),
  'institution'  VARCHAR(45) NULL
);


INSERT INTO tbl_user VALUES ('imtech', 'tech@test.com',  'pswtech', 'technician', 'up7d') ;
INSERT INTO tbl_user VALUES  ( 'imsup','sup@sup.com', 'pswsup', 'supervisor', 'up7d');
INSERT INTO tbl_user VALUES  ( 'azertyuiop','bim@bim.bim', 'ioioioioio', 'supervisor', 'up7d');


CREATE TABLE tbl_photo (
  'id' INTEGER PRIMARY KEY AUTOINCREMENT ,
  'filename' VARCHAR(45), 
  'username' REFERENCES tbl_user(username),
  preparation_type VARCHAR(5) CHECK (preparation_type IN ('thick' , 'thin') ),
  'comment' VARCHAR(256) NULL,
  'magnification' INTEGER,
  'microscope_model'  VARCHAR(45)
);



CREATE TABLE tbl_chunk (
  'id_photo' REFERENCES tbl_photo('id'),
  'col' INTEGER  ,
  'row' INTEGER ,
  'filename' VARCHAR(45),
  PRIMARY KEY ('id_photo', 'col', 'row')
);

CREATE TABLE tbl_annotation (
  'id' INTEGER PRIMARY KEY AUTOINCREMENT,
  'username' REFERENCES tbl_user(username),
  'id_photo' INTEGER,
  'col' INTEGER,
  'row' INTEGER,
  'date' TEXT, /*ISO8601 strings ("YYYY-MM-DDTHH:MM:SS.SSS")*/
  'x' INT,
  'y' INT,
  'width' INT,
  'height' INT,
  annotation VARCHAR(2) CHECK (annotation IN ('P' , 'RC', 'WC', 'O') ), /* parasite, red cell, white cell, other  */
  FOREIGN KEY('id_photo', 'col', 'row') REFERENCES tbl_chunk('id_photo', 'col', 'row')
);


SELECT * FROM tbl_user ;

.quit
