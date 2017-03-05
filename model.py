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
from app import db, photos
from flask_login import UserMixin
from PIL import Image
import itertools
import datetime


# Whan table already exist, we do not need to redefine them
# we can just load them from the database using the "autoload" feature.

class User(db.Model, UserMixin):
    """
    User model.

    Interact with the database and with the Flask-login module.
    """
    __tablename__ = 'tbl_user'
    username = db.Column(db.String(30), primary_key=True)
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(20))
    level = db.Column(db.String(10))
    institution = db.Column(db.String(50))

    #Defining One to Many relationships with the relationship function on the Parent Table
    photos = db.relationship('Photos', backref="user", lazy='dynamic')
    # backref="user" : This argument adds a user attribute on the Photo table, so you can access a User via the Photos Class as Photo.user.
    # omit the cascade argument : keep the children when you delete the parent
    # lazy="dynamic": This will return a query object which you can refine further like if you want to add a limit etc.

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
    id = db.Column(db.Integer, primary_key=True)
    extension = db.Column(db.String(5))
    preparation_type = db.Column(db.String(5))
    # CHECK (preparation_type IN ('thick' , 'thin') )
    comment  = db.Column(db.Text)
    magnification  = db.Column(db.Integer)
    microscope_model  = db.Column(db.String(20))

    #Defining the Foreign Key on the Child Table :
    username = db.Column(db.String(30), db.ForeignKey('User.username'))
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))


    def __init__(self, num_col = 2, num_row = 2):
        """

        self.chunks_numerotation : list of tuples of 2 int
            (col, row) coordinates of the chunk
            for each chunk
        """
        self.num_col = num_col
        self.num_row = num_row

        self.chunks_numerotation = [(col,row) for col in  range(num_col) for row in range(num_row)]

    @property
    def filename (self) :
        return '{0}.{1}'.format(self.id, self.extension )

    def get_filename(self) :
        """
        Function that uses the corresponding property
        This can be used in jinja template
        """
        return self.filename

    @property
    def path(self):
        return photos.path(self.filename)

    def get_path(self) :
        """
        Function that uses the corresponding property
        This can be used in jinja template
        """
        return self.path

    def get_chunks_infos(self) :
        """
        Get infos (numerotation and coordinates) of desired chunks

        Return :
        ---------
        chunks_coords : iterator
            for each chunk :
            ((left , upper) , (right , lower))
            pixel coordinates of the chunk
        """
        img = Image.open(self.path)
        width, height = img.size

        # compute crop properties using image measure
        # and the wanted number of pieces
        width_crop_col = width / num_col
        width_crop_row = height / num_row

        # values in cut_col and cut_row represent Cartesian pixel coordinates.
        # 0,0 is up left
        # the norm between 2 ticks on horizontal x axis is width_crop_col
        # the norm between 2 ticks on vertical y axis is width_crop_row
        cut_col = [width_crop_col * e for e in range (num_col +1)]
        cut_row = [width_crop_row * e for e in range (num_row +1)]
        # +1 in order to have coord of rigth limit of the image

        chunks_starting_coords = itertools.product(cut_col[:-1], cut_row[:-1])
        chunks_ending_coords = itertools.product(cut_col[1:], cut_row[1:])

        chunks_coords = zip (chunks_starting_coords, chunks_ending_coords)

        return chunks_coords


    def crop(self, chunk_numerotation, coords):
        """ Crop the photo to the given coord

        Arguments :
        -----------
        chunk_numerotation : tuple of 2 inserting-records
            (col, row)

        coords : tuple of 2 tuple of 2 ints
            coordinates of the crop :
            ( (left, upper), (right , lower) )
        """

        chunk_col, chunk_row = chunk_numerotation
        chunk_path = self.get_chunk_path (chunk_col, chunk_row )

        img = Image.open(chunk_path)
        box = list(itertools.chain.from_iterable(chunk_coords)) #(left , upper , right , lower) # pixel coords of the chunk
        new_chunk = img.crop(box)
        new_chunk.save (chunk_path)

    def make_chunks(self):
        """
        Slice an image into (default : 4) equal parts.
        """
        chunks_coords = self.get_chunks_infos()
        for chunk_idx, chunk_coords in enumerate(chunks_coords) :
            self.crop (chunks_numerotation[chunk_idx], chunk_coords)


    def get_chunk_filename(self, chunk_col, chunk_row) :
        #TODO : check the given row and col are okay
        return '{0}_{1}_{2}.{3}'.format(
            self.id,
            chunk_col, chunk_row,
            self.extension # extension
        )

    def get_chunk_path(self, chunk_col, chunk_row) :
        return './chunks/{0}'.format(self.get_chunk_filename(chunk_col, chunk_row))


class Patient(db.Model):
    """
    Patient Model

    Interact with the database.
    """
    __tablename__ = 'tbl_patient'
    id = db.Column(db.Integer, primary_key=True)
    age = db.Column(db.Integer)
    gender  = db.Column(db.String(1))
    #Defining One to Many relationships with the relationship function on the Parent Table
    photos = db.relationship('Photo', backref="patient", lazy='dynamic')
    # backref="chunk" : This argument adds a photo attribute on the ANnotation table, so you can access a Chunk via the Annotation Class as Annotation.chunk.
    # Omit the cascade argument -> keep the children around when the parent is deleted.
    # lazy="dynamic": This will return a query object which you can refine further like if you want to add a limit etc.



class Annotation(db.Model) :
    """
    Annotation model

    Interact with the database.
    """
    __tablename__ = 'tbl_annotation'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime)
    x = db.Column(db.Integer)
    y = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    annotation = db.Column(db.String(3))
    # CHECK (annotation IN (...) ), /* parasite, red cell, white cell, other  */
    # see table of annotations

    #Defining the Foreign Key on the Child Table


    def __init__(self, user, , x, y, width, height, annotation):
        """
        Constructor of an instance of the Annotation class

        Arguments :
        -----------
        user : instance of user
            user that added the annotation

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

        self.date = datetime.datetime.utcnow().isoformat()
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.annotation = annotation
