from flask import render_template

from app import app
from forms import RegisterForm
from model import *

@app.route("/")
def index():
    """
    Define the basic route / and its corresponding request handler
    """
    return render_template('index.html')

@app.route("/signup", methods = ['GET', 'POST'])
def signup():
    """
    """
    form = RegisterForm()
    if form.validate_on_submit() :
        okay = True
        #-----
        # TODO : check provided data in request.form['tag'], flash (u 'msg', 'error') if pb :

        # username not already use,

        # password is secure enough

        # email adress okay

        if okay :
            # TODO : send confirmation email

            # save the guy
            new_user = User()
            form.populate_obj(new_user)
            print (new_user)
            print (form)


            try :
                db.session.add(new_user)
                db.session.commit()
                print('New user added to database')
            except Exception as e:
                print (e)
                db.session.rollback()
                print('An error occurred accessing the database.')
                redirect('/')

    return render_template('signup.html', form=form)

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
