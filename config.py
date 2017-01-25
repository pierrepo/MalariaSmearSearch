class Config(object):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db' #'sqlite://:memory:'
    #engine://user:password@host:port/database
    
    TOP_LEVEL_DIR = '.'
    # Uploads
    UPLOADS_DEFAULT_DEST = TOP_LEVEL_DIR + '/default_up'
    UPLOADED_PHOTOS_DEST = TOP_LEVEL_DIR + '/up'

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = 'dev'

class TestingConfig(Config):
    TESTING = True
