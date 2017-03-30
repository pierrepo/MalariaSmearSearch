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
import os



def get_hr_file_size(path):
    """
    Get human readable file size

    Argument :
    ----------
    path : string
        the path to the file of which you want the size
    Return :
    --------
    size : string
        value with the right unit
        among ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    """
    nbytes = os.path.getsize(path)

    SIZE_UNIT = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

    if nbytes == 0: return '0 B'
    i = 0
    while  nbytes >= 1024 and i < len(SIZE_UNIT)-1:
        nbytes /= 1024.
        i += 1
    f = ('%.2f' %  nbytes).rstrip('0').rstrip('.')
    return '%s %s' % (f, SIZE_UNIT[i])

def get_img_pixel_size(path) :
    """
    Get human pixel size

    Argument :
    ----------
    path : string
        the path to the image of which tyou want the pixel size
    Return :
    ---------
    size : tuple of 2 ints
        (width, height) pixel values
    """
    with Image.open(path) as img :
        return img.size


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
    username =  db.Column(db.String(30), db.ForeignKey('Users_auth.username'), primary_key=True)
    secondary_institution_name = db.Column(db.String(50), primary_key=True)


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
    primary_institution_name = db.Column(db.String(50))

    secondary_institutions = db.relationship('Membership', backref='user',
                                lazy='dynamic')

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


class User(db.Model):
    """
    User model.

    Interact with the database and with the Flask-login module.
    """
    __bind_key__ = 'data'
    __tablename__ = 'Users' # tablename

    username = db.Column(db.String(30), primary_key=True)
    primary_institution_name = db.Column(db.String(50), db.ForeignKey('Institutions.name')) # tablename


class Institution(db.Model):
    """
    Institution model.

    Interact with the database.
    """
    __bind_key__ = 'data'
    __tablename__ = 'Institutions' # tablename

    name = db.Column(db.String(50), primary_key=True)
    place = db.Column(db.String(100))
    description = db.Column(db.Text)
    url= db.Column(db.String(100))
    comment = db.Column(db.Text)

    users = db.relationship('User', backref='primary_institution',
                                lazy='dynamic')
    patients = db.relationship('Patient', backref='institution',
                                lazy='dynamic')

    def __init__(self, name, place, description, url, comment):
        """
        Arguments :
        ----------
        name : string max 50 chars
            name of the institution
        place : string max 100 chars
            place of the institution
        description : string
            description of the institution
        url : string max 100 chars
            url of the institution
        comment : string
            comment of the institution
        """
        self.name = name
        self.place = place
        self.description = description
        self.url= url
        self.comment = comment

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

    # http://docs.sqlalchemy.org/en/rel_0_9/orm/join_conditions.html#handling-multiple-join-paths :
    username_upload = db.Column(db.String(30), db.ForeignKey('Users.username')) # tablename
    user_upload = db.relationship('User', backref="uploaded_samples", foreign_keys=[username_upload])
    username_update = db.Column(db.String(30), db.ForeignKey('Users.username')) # tablename
    user_update = db.relationship('User', backref="updated_samples", foreign_keys=[username_update])

    patient_id = db.Column(db.Integer, db.ForeignKey('Patients.id')) # tablename

    #Defining One to Many relationships with the relationship function on the Parent Table
    annotations = db.relationship('Annotation', backref="sample", cascade="all, delete-orphan" , lazy='dynamic')
    # backref="sample" : This argument adds a sample attribute on the Annotation table, so you can access a Sample via the Annotation Class as Annotation.sample.
    # cascade ="all, delete-orphan”: This will delete all chunks of a sample when the referenced sample is deleted.
    # lazy="dynamic": This will return a query object which you can refine further like if you want to add a limit etc.

    MAX_CHUNK_SIZE = 2000 #px

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
        Initialize sample properties.

        http://docs.sqlalchemy.org/en/latest/orm/constructors.html
        """
        self.chunks_numerotation = [(col,row) for col in  range(self.num_col) for row in range(self.num_row)]
        self.filename = '{0}.{1}'.format(self.id, self.extension)
        self.path = samples_set.path(self.filename)
        self.size = get_hr_file_size(self.path)
        self.width, self.height = get_img_pixel_size(self.path)
        print('Image {}: {} x {} px / {}'.format(self.path, self.width, self.height, self.size))


    def make_chunks(self):
        """
        Slice an image into equal parts.
        """

        with Image.open(self.path) as img :
            #----------
            # get chunk infos (numerotation and coordinates) of desired chunks

            # compute crop properties using image measure
            # and the wanted number of pieces
            width_crop_col = self.width / self.num_col
            width_crop_row = self.height / self.num_row

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

    def get_chunk_size(self, chunk_col, chunk_row) :
        path = self.get_chunk_path(chunk_col, chunk_row)
        return get_hr_file_size(path)

    def get_chunk_pixel_size(self, chunk_col, chunk_row) :
        path = self.get_chunk_path(chunk_col, chunk_row)
        return get_img_pixel_size(path)

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
    gender  = db.Column(db.String(1))
    ref = db.Column(db.String(50))
    institution_name  =  db.Column(db.String(50), db.ForeignKey('Institutions.name')) # tablename
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

    # http://docs.sqlalchemy.org/en/rel_0_9/orm/join_conditions.html#handling-multiple-join-paths :
    username_creation = db.Column(db.String(30), db.ForeignKey('Users.username')) # tablename
    user_creation = db.relationship('User', backref="created_annotations", foreign_keys=[username_creation])
    username_update = db.Column(db.String(30), db.ForeignKey('Users.username')) # tablename
    user_update = db.relationship('User', backref="updated_annotations", foreign_keys=[username_update])

    sample_id = db.Column(db.Integer, db.ForeignKey('Samples.id')) # tablename

    anno_decoder = {
        "PUR":"Parasite - Unknown species - Ring",
        "PUT":"Parasite - Unknown species - Trophzoide",
        "PUS":"Parasite - Unknown species - Schizont",
        "PUG":"Parasite - Unknown species - Gametocyte",
        "PUU":"Parasite - Unknown species - Unknown",
        "PFR":"Parasite - P. Falciparum - Ring",
        "PFT":"Parasite - P. Falciparum - Trophzoide",
        "PFS":"Parasite - P. Falciparum - Schizont",
        "PFG":"Parasite - P. Falciparum - Gametocyte",
        "PFU":"Parasite - P. Falciparum - Unknown",
        "PMR":"Parasite - P. Malariae - Ring",
        "PMT":"Parasite - P. Malariae - Trophzoide",
        "PMS":"Parasite - P. Malariae - Schizont",
        "PMG":"Parasite - P. Malariae - Gametocyte",
        "PMU":"Parasite - P. Malariae - Unknown",
        "POR":"Parasite - P. Ovale - Ring",
        "POT":"Parasite - P. Ovale - Trophzoide",
        "POS":"Parasite - P. Ovale - Schizont",
        "POG":"Parasite - P. Ovale - Gametocyte",
        "POU":"Parasite - P. Ovale - Unknown",
        "PVR":"Parasite - P. Vivax - Ring",
        "PVT":"Parasite - P. Vivax - Trophzoide",
        "PVS":"Parasite - P. Vivax - Schizont",
        "PVG":"Parasite - P. Vivax - Gametocyte",
        "PVU":"Parasite - P. Vivax - Unknowns",
        "RBC":"Red Blood Cell",
        "WBC":"White Blood Cell",
        "THR":"Platelet",
        "ART":"Artefact"
     }

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
