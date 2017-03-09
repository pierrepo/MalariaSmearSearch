class Config(object):

    #-----
    # general configuration :
    DEBUG = False
    TESTING = False

    #-----
    # configaration of Flask-SQLAlchemy

    # which db :
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db' #'sqlite://:memory:'
    #engine://user:password@host:port/database

    #-----
    # paths config :
    TOP_LEVEL_DIR = '.'

    #-----
    # configuration of Flask-Uploads

    UPLOADS_DEFAULT_DEST = TOP_LEVEL_DIR + '/default_up'
    UPLOADED_PHOTOS_DEST = TOP_LEVEL_DIR + '/up'

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = 'dev'

class TestingConfig(Config):
    TESTING = True
