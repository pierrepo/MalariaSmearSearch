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
from app import app, db, samples_set
from flask_login import UserMixin
from flask_sqlalchemy import sqlalchemy
from sqlalchemy.ext.associationproxy import association_proxy
from PIL import Image
import itertools
import datetime


# Many to many relationship
# http://flask-sqlalchemy.pocoo.org/2.1/models/#many-to-many-relationships
# https://techarena51.com/index.php/many-to-many-relationships-with-flask-sqlalchemy/
# http://stackoverflow.com/questions/25668092/flask-sqlalchemy-many-to-many-insert-data
# Many to many relationship * with additional column * :
# http://docs.sqlalchemy.org/en/latest/orm/basic_relationships.html#association-object
# http://docs.sqlalchemy.org/en/latest/orm/extensions/associationproxy.html#simplifying-association-objects

class Membership(db.Model):
    __bind_key__ = 'users'
    __tablename__ = 'Memberships'
    username =  db.Column(db.String(30), db.ForeignKey('Users_auth.username'), primary_key=True) # left_id
    institution_name = db.Column(db.String(50), db.ForeignKey('Institutions.name'), primary_key=True) #right_id
    original = db.Column(db.Boolean()) #extra_data

    # bidirectional attribute/collection of "user"/"user_keywords"
    user = db.relationship('User_auth',
                backref=db.backref("user_institutions")
            )

    # reference to the "Institution" object
    institution = db.relationship("Institution")


    def __init__(self, institution=None, user=None, original=False):
        self.institution= institution
        self.user = user
        self.original = original



    def __repr__(self):
        return "{0}, {1}, {2}".format (
            self.institution_name ,
            self.username,
            self.original
        )



class User_auth(db.Model, UserMixin):
    """
    User model.

    Interact with the database and with the Flask-login module.
    """
    __bind_key__ = 'users'
    __tablename__ = 'Users_auth' # tablename

    username = db.Column(db.String(30), primary_key=True)
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(20))

    # association proxy of "user_institutions" collection
    # to "institution" attribute
    institutions = association_proxy('user_institutions', 'institution')

    def __repr__(self):
        """
        Build a printable representation of a user.

        Return :
        --------
        repr : string
            printable representation of a user.
        """
        return 'User : %r , email = %r, password = %r' %  (
            self.username ,
            self.email,
            self.password
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

    @property
    def original_institution (self) :
        print (Membership.query.filter(Membership.username == self.username, Membership.original == True) )
        print (Membership.query.filter(Membership.username == self.username, Membership.original == True).first() )
        print ('====================')
        original_institution = Membership.query.filter(Membership.username == self.username, Membership.original == True).first()
        return original_institution.institution



class Institution(db.Model):
    """
    Institution model.

    Interact with the database.
    """
    __bind_key__ = 'users'
    __tablename__ = 'Institutions' # tablename

    name = db.Column(db.String(50), primary_key=True)

    def __init__(self, name):
        """

        self.name : string
            name of the institution
        """
        self.name = name



class User(db.Model):
    """
    User model.

    Interact with the database and with the Flask-login module.
    """
    __bind_key__ = 'data'
    __tablename__ = 'Users' # tablename

    username = db.Column(db.String(30), primary_key=True)
    original_institution = db.Column(db.String(50))

    #Defining One to Many relationships with the relationship function on the Parent Table
    samples = db.relationship('Sample', backref="user", lazy='dynamic')
    annotations = db.relationship('Annotation', backref="user", lazy='dynamic')
    # backref="user" : This argument adds a user attribute on the Sample table, so you can access a User via the Samples Class as Sample.user.
    # omit the cascade argument : keep the children when you delete the parent
    # lazy="dynamic": This will return a query object which you can refine further like if you want to add a limit etc.



class Sample(db.Model):
    """
    Sample Model

    Interact with the database.
    """
    __bind_key__ = 'data'
    __tablename__ = 'Samples' # tablename

    id = db.Column(db.Integer, primary_key=True)
    extension = db.Column(db.String(5))
    smear_type = db.Column(db.String(5))
    # CHECK (smear_type IN ('thick' , 'thin') )

    date_upload = db.Column(db.DateTime)
    date_update = db.Column(db.DateTime)

    comment  = db.Column(db.Text)
    license  = db.Column(db.String(5))
    provider = db.Column(db.Text)
    magnification  = db.Column(db.Integer)

    num_col = db.Column(db.Integer)
    num_row = db.Column(db.Integer)

    #Defining the Foreign Key on the Child Table :
    username = db.Column(db.String(30), db.ForeignKey('Users.username')) # tablename
    patient_id = db.Column(db.Integer, db.ForeignKey('Patients.id')) # tablename

    #Defining One to Many relationships with the relationship function on the Parent Table
    annotations = db.relationship('Annotation', backref="sample", cascade="all, delete-orphan" , lazy='dynamic')
    # backref="sample" : This argument adds a sample attribute on the Annotation table, so you can access a Sample via the Annotation Class as Annotation.sample.
    # cascade ="all, delete-orphan”: This will delete all chunks of a sample when the referenced sample is deleted.
    # lazy="dynamic": This will return a query object which you can refine further like if you want to add a limit etc.

    MAX_CHUNK_SIZE = 1000 #px

    def __init__(self):
        """

        self.chunks_numerotation : list of tuples of 2 int
            (col, row) coordinates of the chunk
            for each chunk
        """
        self.date_upload = datetime.datetime.utcnow()

    #@sqlalchemy.orm.reconstructor # do not seems to work TODO : find why
    def init_on_load(self):
        """
        http://docs.sqlalchemy.org/en/latest/orm/constructors.html
        """
        try :
            self.chunks_numerotation = [(col,row) for col in  range(self.num_col) for row in range(self.num_row)]
        except :
            print ('chunk_numerotation could not be initialize. num_col and num_row missing')
        self.filename = '{0}.{1}'.format(self.id, self.extension )
        self.path = samples_set.path(self.filename)


    def make_chunks(self):
        """
        Slice an image into equal parts.
        """

        with Image.open(self.path) as img :
            #----------
            # get chunk infos (numerotation and coordinates) of desired chunks
            width, height = img.size

            # compute crop properties using image measure
            # and the wanted number of pieces
            width_crop_col = width / self.num_col
            width_crop_row = height / self.num_row

            # values in cut_col and cut_row represent Cartesian pixel coordinates.
            # 0,0 is up left
            # the norm between 2 ticks on horizontal x axis is width_crop_col
            # the norm between 2 ticks on vertical y axis is width_crop_row
            cut_col = [width_crop_col * e for e in range (self.num_col +1)]
            cut_row = [width_crop_row * e for e in range (self.num_row +1)]
            # +1 in order to have coord of rigth limit of the image

            chunks_starting_coords = itertools.product(cut_col[:-1], cut_row[:-1])
            chunks_ending_coords = itertools.product(cut_col[1:], cut_row[1:])

            chunks_coords = zip (chunks_starting_coords, chunks_ending_coords)
            #iterator. for each chunk :
            #((left , upper) , (right , lower))
            #pixel coordinates of the chunk

            #----------
            for chunk_idx, chunk_coords in enumerate(chunks_coords) :
                chunk_col, chunk_row  = self.chunks_numerotation[chunk_idx]
                chunk_path = self.get_chunk_path (chunk_col, chunk_row )
                box = list(itertools.chain.from_iterable(chunk_coords)) #(left , upper , right , lower) # pixel coords of the chunk
                new_chunk = img.crop(box)
                new_chunk.save (chunk_path)


    def get_chunk_filename(self, chunk_col, chunk_row) :
        #TODO : check the given row and col are okay
        return '{0}_{1}_{2}.{3}'.format(
            self.id,
            chunk_col, chunk_row,
            self.extension # extension
        )

    def get_chunk_path(self, chunk_col, chunk_row) :
        return '{0}/{1}'.format(app.config['CHUNKS_DEST'], self.get_chunk_filename(chunk_col, chunk_row))

    def get_chunks_paths(self) :
        paths_array = []
        for col in range (self.num_col) :
            for row in range (self.num.row) :
                path_cur_chunk = self.get_chunk_path(col, row)
                paths_array.append(path_cur_chunk)
        return paths_array

class Patient(db.Model):
    """
    Patient Model

    Interact with the database.
    """
    __bind_key__ = 'data'
    __tablename__ = 'Patients' # tablename

    id = db.Column(db.Integer, primary_key=True)
    age = db.Column(db.Integer)
    gender  = db.Column(db.String(1))
    ref = db.Column(db.String(50))
    institution  =  db.Column(db.String(50))
    year_of_birth = db.Column(db.Integer) #could be datetime
    city = db.Column(db.String(50))
    country = db.Column(db.String(50))

    #Defining One to Many relationships with the relationship function on the Parent Table
    samples = db.relationship('Sample', backref="patient", lazy='dynamic')
    # backref="chunk" : This argument adds a sample attribute on the ANnotation table, so you can access a Chunk via the Annotation Class as Annotation.chunk.
    # Omit the cascade argument -> keep the children around when the parent is deleted.
    # lazy="dynamic": This will return a query object which you can refine further like if you want to add a limit etc.



class Annotation(db.Model) :
    """
    Annotation model

    Interact with the database.
    """
    __bind_key__ = 'data'
    __tablename__ = 'Annotations' # tablename

    id = db.Column(db.Integer, primary_key=True)
    col = db.Column(db.Integer)
    row = db.Column(db.Integer)
    date_creation = db.Column(db.DateTime)
    date_update = db.Column(db.DateTime)
    x = db.Column(db.Integer)
    y = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    annotation = db.Column(db.String(3))
    # CHECK (annotation IN (...) ), /* parasite, red cell, white cell, other  */
    # see table of annotations

    #Defining the Foreign Key on the Child Table :
    username = db.Column(db.String(30), db.ForeignKey('Users.username')) # tablename
    sample_id = db.Column(db.Integer, db.ForeignKey('Samples.id')) # tablename



    def __init__(self, user, sample, chunk_numerotation, x, y, width, height, annotation):
        """
        Constructor of an instance of the Annotation class

        Arguments :
        -----------
        user : instance of user
            user that added the annotation
        sample : instance of Sample
            the sample on which the annotation is made
        chunk_numerotation : tuple of 2 int
            the chunk localisation on the image as
            (col, row)
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
        self.sample_id = sample.id
        self.col, self.row = chunk_numerotation
        self.date = datetime.datetime.utcnow()
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.annotation = annotation
