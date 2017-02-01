"""
Define views of the application

URLs are define without trailing slashes.
HTML templates are in the templates folder.
"""
from flask import render_template, request, redirect, url_for, Response, send_file
from flask_login import login_required, login_user, logout_user
import os

from app import app, login_manager, photos
from forms import RegisterForm, LoginForm, UploadForm
from model import *

# the route() decorator tells Flask what URL should trigger the function.
# the functions render associated template stored in templates folder.

@login_manager.user_loader
def load_user(username):
    """
    Callback used to reload the user object associated to a given username.

    Argument :
    ----------
    username : string
        a possible username of a user.

    Return :
    --------
    user : None / User
        the corresponding user object.
    """
    print (User.query.filter(User.username == username).first() )
    return User.query.filter(User.username == username).first()



@app.route('/restrictedarea')
@login_required
def test():
    """
    View test for a page restricted to logged in users.
    """
    return "here you are ! in a restricted area, oh my gosh"

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    """
    View of the page where logged in users can access the form to upload photos.
    """
    form = UploadForm()

    if form.validate_on_submit() : # -> it is a POST request and it is valid

        # get the photo and its database attributes !
        new_photo = Photo()
        form.populate_obj(new_photo)
        print (new_photo)
        print (form)

        try :
            # add the photo in the database :
            db.session.add(new_photo)
            db.session.commit()

            print('New photo added to database, tis id is {0}'.format(new_photo.id))
            # upload the photo
            # its name is the photo id in the database
            new_photo.filename = photos.save(
                storage = form.photo.data, # The uploaded file to save.
                name = '{0}.'.format(new_photo.id) #The name to save the file.
                    # as it ends with a dot, the file’s extension
                    # will be appended automatically to the end.
            )
            # save its path
            new_photo.path=photos.path(new_photo.filename)
            # cut the photo into chunks :
            chunks_numerotation, chunks_coords = new_photo.get_chunks_infos()
            for chunk_idx, chunk_coords in enumerate(chunks_coords) :
                new_chunk = Chunk(new_photo, chunks_numerotation[chunk_idx], chunk_coords)
                db.session.add(new_chunk)
            db.session.commit()
            # TODO get its URL
            # TODO print its URL
        except Exception as e:
            # TODO : catch the different kind of exception that could occurred.
            print (e)
            db.session.rollback()
            print('An error occurred accessing the database.')
            redirect('/')

    return render_template('upload.html', form = form)

@app.route("/")
def index():
    """
    View of the index page.
    """
    return render_template('index.html')

@app.route("/signup", methods = ['GET', 'POST'])
def signup():
    """
    View of the signup page.

    The page contain a form to register new users.
    If posted, data in the form are processed to add a new user in the database.

    If an error occured accessing the database, there is a redirection to the
    index page.
    """
    form = RegisterForm()

    if form.validate_on_submit() : # -> it is a POST request and it is valid
        okay = True
        #-----
        # TODO : check provided data in request.form['tag'], flash (u 'msg', 'error') if pb :

        # username not already use,

        # password is secure enough

        # email adress okay

        if okay :
            # TODO : send confirmation email

            # Crate the user profil
            new_user = User()
            form.populate_obj(new_user)
            print (new_user)
            print (form)

            # Save the guy in the db
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
    View of the login page.

    A user can log in if the provided username and password match.
    Else, the authentification fails.
    """
    form = LoginForm()
    if form.validate_on_submit():  # -> it is a POST request and it is valid
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
    View of the logout page.

    A logged in user accessing this page is logged out.
    """
    # TODO : what happen if a logout user access logout page ?
    logout_user()
    return Response('<p>Logged out</p>')

@app.route("/account")
def account():
    """
    View of the account page.
    """
    #TODO
    return render_template('account-page.html')

@app.route('/browse')
def browse():
    # list photo in dir upload :
    photos = os.listdir(app.config['UPLOADED_PHOTOS_DEST'] )
    print (photos)
    return render_template('browse.html', photos = photos, app = app )

@app.route('/download/<photo_id>')
def download(photo_id):
    #photo_id = secure_filename(photo_id)
    print (app.root_path + '/' + app.config['UPLOADED_PHOTOS_DEST'] + '/' +  photo_id)
    if os.path.isfile(app.root_path + '/' + app.config['UPLOADED_PHOTOS_DEST'] + '/' + photo_id): # if the file exists
        # send it :
        return send_file(app.root_path + '/' + app.config['UPLOADED_PHOTOS_DEST']+ '/' +  photo_id, as_attachment=True)
    else:
        # return to the photo list with a flash error message
        print("Photo {photo_id} doesn't exists.".format(photo_id=photo_id))
        return redirect(url_for('browse'))
