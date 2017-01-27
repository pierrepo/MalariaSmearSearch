"""
Define the model layer with the database instance and model declaration

Attributes :
------------

db : instance of the flask_sqlalchemy.SQLAlchemy class
    controls the SQLAlchemy integration to a very specific Flask application
    (that is app.app)

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
    """
    __tablename__ = 'tbl_photo'
    __table_args__ = {
        'autoload': True,
        'autoload_with': db.engine
    }

    def make_chunks(self, num_h_crop = 2, num_v_crop = 2):
        """
        Slice an image into (default : 4) equal parts.

        Arguments :
        -----------
        num_h_crop : int (default 2)
            The number of horizontal chunks we will end up with.
        num_v_crop : int (default 2)
            The number of vertical chunks we will end up with.
        """

        img = Image.open(self.path)
        width, height = img.size

        # compute crop properties using image measure
        # and the wanted number of pieces
        h_crop_width = width / num_h_crop
        v_crop_width = height / num_v_crop

        # x and y represent Cartesian pixel coordinates.
        # 0,0 is up left
        # the norm between 2 ticks on horizontal x axis is h_crop_width
        # the norm between 2 ticks on vertical y axis is v_crop_width
        x = [h_crop_width * e for e in range (num_h_crop +1)]
        y = [v_crop_width * e for e in range (num_v_crop +1)]
        # +1 in order to have coord of rigth limit of the image

        chunks_starting_coords = itertools.product(x[:-1], y[:-1])
        chunks_ending_coords = itertools.product(x[1:], y[1:])

        chunks_coords = zip (chunks_starting_coords, chunks_ending_coords)
        for chunk_idx, chunk_coords in enumerate(chunks_coords) :
            ((left, upper), (right, lower)) = chunk_coords
            box = (left , upper , right , lower) # pixel coords of the chunk
            print (chunk_idx, box)
            new_chunk = img.crop(box)
            print (self.path.split('.')[-1])
            print ("=========== ici")
            new_chunk.save ('./chunks/{0}_{1}.{2}'.format(
                self.id,
                chunk_idx,
                self.path.split('.')[-1]) # extention
            )
