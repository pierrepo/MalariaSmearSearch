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
import datetime

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
    @property
    def filename (self) :
        return '{0:0>5d}.{1}'.format(self.id, self.extension )

    @property
    def path(self):
        return photos.path(self.filename)

    def get_chunks_infos(self, num_crop_col = 2, num_crop_row = 2) :
        """
        Get infos (numerotation and coordinates) of desired chunks

        Arguments :
        -----------
        num_crop_col : int (default 2)
            The number of horizontal chunks we will end up with.
        num_crop_row : int (default 2)
            The number of vertical chunks we will end up with.

        Returns :
        ---------
        chunks_numerotation : list of tuples of 2 int
            (col, row) coordinates of the chunk
            for each chunk
        chunks_coords : iterator
            for each chunk :
            ((left , upper) , (right , lower))
            pixel coordinates of the chunk
        """
        img = Image.open(self.path)
        width, height = img.size

        # compute crop properties using image measure
        # and the wanted number of pieces
        width_crop_col = width / num_crop_col
        width_crop_row = height / num_crop_row

        chunks_numerotation = [(col,row) for col in  range(num_crop_col) for row in range(num_crop_row)  ]

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

        return chunks_numerotation, chunks_coords

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

        chunks_numerotation = [(col,row) for col in  range(num_crop_col) for row in range(num_crop_row)  ]

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
            new_chunk.save ('./chunks/{0}_{1}_{2}.{3}'.format(
                self.id,
                *chunks_numerotation[chunk_idx],
                self.path.split('.')[-1]) # extention
            )

class Chunk(db.Model):
    """
    Chunk Model

    Interact with the database.
    """
    __tablename__ = 'tbl_chunk'
    __table_args__ = {
        'autoload': True,
        'autoload_with': db.engine
    }

    def __init__(self, photo, chunk_numerotation, chunk_coords):
        """
        Constructor of an instance of the Chunk class

        Arguments :
        -----------
        photo : instance of Image
            photo of which the chunk is derived
        chunk_numerotation : tuple of 2 int
            (col, row) coordinates of the chunk
        chunks_coords : tuple of 2 tuples of 2 int / float
            pixel coordinates of the chunk :
            ((left , upper) , (right , lower))
        """
        print ('laa')
        # TODO : use :
        #super().__init__()#photo.id, *chunk_numerotation)
        # ?
        self.id_photo = photo.id
        (self.col, self.row) = chunk_numerotation
        print ('dooo')
        self.path = './chunks/{0}_{1}_{2}.{3}'.format(
            photo.id,
            self.col, self.row,
            photo.path.split('.')[-1] # extention
        )
        self.make_chunk(photo, chunk_coords)

    def make_chunk(self, photo, chunk_coords):
        img = Image.open(photo.path)
        box = list(itertools.chain.from_iterable(chunk_coords)) #(left , upper , right , lower) # pixel coords of the chunk
        print (self.col, self.row, box)
        new_chunk = img.crop(box)
        new_chunk.save (self.path)

class Annotation(db.Model) :
    """
    Annotation model

    Interact with the database.
    """
    __tablename__ = 'tbl_annotation'
    __table_args__ = {
        'autoload': True,
        'autoload_with': db.engine
    }

    def __init__(self, user, chunk, x, y, width, height, annotation):
        """
        Constructor of an instance of the Annotation class

        Arguments :
        -----------
        user : instance of user
            user that added the annotation
        chunk : instance of Chunk
            chunk on which the annotation is made
        x : int
            col coord of the rectangle area
        y : int
            row coord of the rectangle area
        width : int
            (horizontal) width of the rectangle area
        height : int
            (vertical) height of the rectangle area
        annotation : string
            the description of the annotation picked in the taxonomy
        """

        self.username = user.username
        self.id_photo = chunk.id_photo
        self.col = chunk.col
        self.row = chunk.row
        self.date = datetime.datetime.utcnow().isoformat()
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.annotation = annotation
