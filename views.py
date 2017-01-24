from flask import render_template
from flask_login import login_required, login_user

from app import app, login_manager
from forms import RegisterForm, LoginForm
from model import *



@login_manager.user_loader
def load_user(username):
    """
    Callback used to reload the user object associated to a given username.

    Argument :
    ----------
    username : string
    a possible username of a user

    Return :
    --------
    user : None / User
    the corresponding user object
    """
    print (User.query.filter(User.username == username).first() )
    return User.query.filter(User.username == username).first()



@app.route('/restrictedarea')
@login_required
def test():
    """Restricted area"""

    return "here you are ! in a restricted area, oh my gosh"

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

@app.route("/login", methods=['GET', 'POST'])
def login():
    """
    """
    form = LoginForm()
    if form.validate_on_submit():
        print ("=========== validation du log form !!! ")
        print (form.password)
        print (form.username.data, form.password.data)
        # validate the user then log the user
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.password == form.password.data :
            login_user(user)
            print('Logged in successfully.')
        else :
            print ('Authentification failed')
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
