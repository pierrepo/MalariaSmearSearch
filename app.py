from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy


import config

app = Flask(__name__)
app.config.from_object('config.DevelopmentConfig')


db = SQLAlchemy(app)

# Table already exist, so do not redefine it and just
# load them from the database using the "autoload" feature.

class User(db.Model):
    __tablename__ = 'tbl_user'
    __table_args__ = {
        'autoload': True,
        #'schema': 'test.db',
        'autoload_with': db.engine
    }


@app.route("/")
def main():
    """
    Define the basic route / and its corresponding request handler
    """
    return render_template('index.html')

@app.route("/signup")
def signup():
    """
    """
    return render_template('signup.html')

@app.route("/login")
def login():
    """
    """
    return render_template('login.html')

@app.route("/logout")
def logout():
    """
    """
    return "logout"

@app.route("/account")
def account():
    """
    """
    return render_template('account-page.html')


if __name__ == "__main__":
    # Run the app if the executed file is the main program
    app.run()
