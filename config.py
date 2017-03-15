class Config(object):

    #-----
    # general configuration :
    DEBUG = False
    TESTING = False

    #-----
    # configaration of Flask-SQLAlchemy

    # which db :
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db' #'sqlite://:memory:'

    # new model, bind dbs :
    #http://flask-sqlalchemy.pocoo.org/2.1/binds/
    #engine://user:password@host:port/database
    SQLALCHEMY_BINDS = {
        'users': 'sqlite:///users.db',
        'data': 'sqlite:///data.db'
    }

    #https://github.com/mitsuhiko/flask-sqlalchemy/issues/471

    #-----
    # paths config :
    TOP_LEVEL_DIR = '.'

    CHUNKS_DEST = TOP_LEVEL_DIR + '/chunks'

    #-----
    # configuration of Flask-Uploads

    UPLOADS_DEFAULT_DEST = TOP_LEVEL_DIR + '/default_up'
    UPLOADED_SAMPLES_DEST = TOP_LEVEL_DIR + '/samples'

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = 'dev'

class TestingConfig(Config):
    TESTING = True
