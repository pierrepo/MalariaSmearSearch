from flask import render_template, request, redirect, url_for, Response
from flask_login import login_required, login_user, logout_user

from app import app, login_manager, photos
from forms import RegisterForm, LoginForm, UploadForm
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

@login_required
@app.route('/upload', methods=['GET', 'POST'])
def upload():
    form = UploadForm()
    if form.validate_on_submit() :
        new_photo = Photo()
        form.populate_obj(new_photo)
        print (new_photo)
        print (form)

        try :
            # add image in db
            db.session.add(new_photo)
            db.session.commit()
            # get its name (photo.id)
            print('New photo added to database, tis id is {0}'.format(new_photo.id))
            # save the file
            # it seems that Flask-Uploads calls werkzeug.secure_filename()
            new_photo.filename = photos.save( storage = form.photo.data, # The uploaded file to save.
                name = '{0}.'.format(new_photo.id) #The name to save the file as. It ends with a dot so the file’s extension will be appended to the end.
            )
            new_photo.path=photos.path(new_photo.filename)
            new_photo.make_chunks()
            # TODO get its URL
            # TODO print its URL
        except Exception as e:
            print (e)
            db.session.rollback()
            print('An error occurred accessing the database.')
            redirect('/')

    return render_template('upload.html', form = form)

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
            next = request.args.get('next')
            #TODO check that next is safe !
            # is_safe_url should check if the url is safe for redirects.
            # See http://flask.pocoo.org/snippets/62/ for an example.
            if not True :#is_safe_url(next):
                return flask.abort(400)
            return redirect(next or url_for('index'))
        else :
            print ('Authentification failed')
    return render_template('login.html', form = form)


@app.route("/logout")
def logout():
    """
    """
    # TODO : what happen if a logout user access logout page ?
    logout_user()
    return Response('<p>Logged out</p>')

@app.route("/account")
def account():
    """
    """
    return render_template('account-page.html')
