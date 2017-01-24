from app import app
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)

# Table already exist, so do not redefine it and just
# load them from the database using the "autoload" feature.

class User(db.Model):
    __tablename__ = 'tbl_user'
    __table_args__ = {
        'autoload': True,
        #'schema': 'test.db',
        'autoload_with': db.engine
    }

    def __repr__(self):
        return 'User : %r , email = %r, password = %r, level = %r, institution = %r' %  (
            self.username ,
            self.email,
            self.password ,
            self.level,
            self.institution
        )
