"""
Define the model layer with the database instance and model declaration

Attributes :
------------

db : instance of the flask_sqlalchemy.SQLAlchemy class
    controls the SQLAlchemy integration to a very specific Flask application
    (that is app.app)

# learn to :
## insert record in the database :
http://flask-sqlalchemy.pocoo.org/2.1/queries/#inserting-records
## delete record :
http://flask-sqlalchemy.pocoo.org/2.1/queries/#deleting-records

About the model declared here :
-------------------------------
They inherite attribute of flask_sqlalchemy.SQLAlchemy.Model

# learn to get data back out of the database :
http://flask-sqlalchemy.pocoo.org/2.1/queries/#querying-records

"""
from app import app, photos
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from PIL import Image
import itertools

db = SQLAlchemy(app)

# Whan table already exist, we do not need to redefine them
# we can just load them from the database using the "autoload" feature.

class User(db.Model, UserMixin):
    """
    User model.

    Interact with the database and with the Flask-login module.
    """
    __tablename__ = 'tbl_user'
    __table_args__ = {
        'autoload': True,
        #'schema': 'test.db',
        'autoload_with': db.engine
    }

    def __repr__(self):
        """
        Build a printable representation of a user.

        Return :
        --------
        repr : string
            printable representation of a user.
        """
        return 'User : %r , email = %r, password = %r, level = %r, institution = %r' %  (
            self.username ,
            self.email,
            self.password ,
            self.level,
            self.institution
        )

    #UserMixin inheritance provide basic implementation for
    #   is_authenticated
    #   is_active
    #   is_anonymous
    # properties and
    #   get_id() method

    # TODO : get_id use id attribut -> replace username attr by id
    @property
    def id (self) :
        return self.username

class Photo(db.Model):
    """
    Photo Model

    Interact with the database.
    """
    __tablename__ = 'tbl_photo'
    __table_args__ = {
        'autoload': True,
        'autoload_with': db.engine
    }

    def make_chunks(self, num_crop_col = 2, num_crop_row = 2):
        """
        Slice an image into (default : 4) equal parts.

        Arguments :
        -----------
        num_crop_col : int (default 2)
            The number of horizontal chunks we will end up with.
        num_crop_row : int (default 2)
            The number of vertical chunks we will end up with.
        """

        img = Image.open(self.path)
        width, height = img.size

        # compute crop properties using image measure
        # and the wanted number of pieces
        width_crop_col = width / num_crop_col
        width_crop_row = height / num_crop_row

        # values in cut_col and cut_row represent Cartesian pixel coordinates.
        # 0,0 is up left
        # the norm between 2 ticks on horizontal x axis is width_crop_col
        # the norm between 2 ticks on vertical y axis is width_crop_row
        cut_col = [width_crop_col * e for e in range (num_crop_col +1)]
        cut_row = [width_crop_row * e for e in range (num_crop_row +1)]
        # +1 in order to have coord of rigth limit of the image

        chunks_starting_coords = itertools.product(cut_col[:-1], cut_row[:-1])
        chunks_ending_coords = itertools.product(cut_col[1:], cut_row[1:])

        chunks_coords = zip (chunks_starting_coords, chunks_ending_coords)
        for chunk_idx, chunk_coords in enumerate(chunks_coords) :
            box = list(itertools.chain.from_iterable(chunk_coords)) #(left , upper , right , lower) # pixel coords of the chunk
            print (chunk_idx, box)
            new_chunk = img.crop(box)
            print (self.path.split('.')[-1])
            print ("=========== ici")
            new_chunk.save ('./chunks/{0}_{1}.{2}'.format(
                self.id,
                chunk_idx,
                self.path.split('.')[-1]) # extention
            )
