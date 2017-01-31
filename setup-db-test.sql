
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


CREATE TABLE tbl_photo (
  'id' INTEGER PRIMARY KEY AUTOINCREMENT ,
  'username' REFERENCES tbl_user(username),
  preparation_type VARCHAR(5) CHECK (preparation_type IN ('thick' , 'thin') ),
  'comment' VARCHAR(256) NULL,
  'magnification' INTEGER,
  'microscope_model'  VARCHAR(45)
);

INSERT INTO tbl_photo ('username', 'preparation_type', 'comment', 'magnification', 'microscope_model')
    VALUES ('imtech', 'thick',  'je suis un commentaire', 1000, 'super microscope trop swag') ;


CREATE TABLE tbl_chunk (
  'id_photo' REFERENCES tbl_level(name),
  'col' INTEGER  ,
  'row' INTEGER , 
  PRIMARY KEY ('id_photo', 'col', 'row')
);


SELECT * FROM tbl_user ;

.quit
