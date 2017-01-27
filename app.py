"""
This module defines and configure the application

Attributes
----------

app : instance of the flask.Flask class
    a WSGI application

photos : instance of the UploadSet class
    define photo / image collection.
"""
from flask import Flask
from flask_login import LoginManager
from flask_uploads import configure_uploads, UploadSet, IMAGES

import config

app = Flask(__name__)
app.config.from_object('config.DevelopmentConfig')

# configure user log via Flask-login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Configure the image uploading via Flask-Uploads
photos = UploadSet('photos', IMAGES)
configure_uploads(app, photos)
