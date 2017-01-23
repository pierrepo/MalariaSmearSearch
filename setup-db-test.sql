
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


SELECT * FROM tbl_user ;

.quit

