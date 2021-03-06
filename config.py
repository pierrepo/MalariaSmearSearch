class Config(object):

    #-----
    # general configuration :
    DEBUG = False
    TESTING = False

    #-----
    # configaration of Flask-SQLAlchemy

    # model, bind dbs :
    #http://flask-sqlalchemy.pocoo.org/2.1/binds/
    #engine://user:password@host:port/database
    SQLALCHEMY_BINDS = {
        'users': 'sqlite:///data/users.db',
        'data': 'sqlite:///data/data.db'
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    #https://github.com/mitsuhiko/flask-sqlalchemy/issues/471

    #-----
    # paths config :
    TOP_LEVEL_DIR = '.'

    CHUNKS_DEST = TOP_LEVEL_DIR + '/data/chunks'

    #-----
    # configuration of Flask-Uploads

    UPLOADS_DEFAULT_DEST = TOP_LEVEL_DIR + '/default_up'
    UPLOADED_SAMPLES_DEST = TOP_LEVEL_DIR + '/data/samples'

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = 'dev'

class TestingConfig(Config):
    TESTING = True
