from flask import Flask
from flask_login import LoginManager

import config

app = Flask(__name__)
app.config.from_object('config.DevelopmentConfig')


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"
