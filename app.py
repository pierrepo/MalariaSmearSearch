"""
This module defines and configure the application

Attributes
----------

app : instance of the flask.Flask class
    a WSGI application

samples_set : instance of the UploadSet class
    define sample collection.
"""
from flask import Flask
from flask_jsglue import JSGlue
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_uploads import configure_uploads, UploadSet, IMAGES

import config

app = Flask(__name__)
app.config.from_object('config.DevelopmentConfig')

# Link the db :
db = SQLAlchemy(app)

# configure user log via Flask-login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"
login_manager.login_message_category = "error"

# Configure the image uploading via Flask-Uploads
samples_set = UploadSet('samples', IMAGES)
configure_uploads(app, samples_set)

# config Flask-JSGlue
# (helps hook up the Flask application nicely with the front end).
jsglue = JSGlue(app)
