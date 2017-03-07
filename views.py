"""
Define views of the application

URLs are define without trailing slashes.
HTML templates are in the templates folder.
"""
import datetime
from flask import render_template, request, redirect, url_for, Response, send_file, jsonify, make_response, flash
from flask_login import login_required, login_user, logout_user, current_user
import pathlib
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
        new_photo.extension = form.photo.data.filename.split('.')[-1].lower()
        # lowercase because the photos set is made from the IMAGE set
        # that do use lowercase extensions.
        # https://pythonhosted.org/Flask-Uploads/#flaskext.uploads.IMAGES

        print (new_photo)
        print (form)

        try :
            # add the photo in the database :
            db.session.add(new_photo)
            db.session.commit()


            # upload the photo
            # its name is the photo 00000id in the database
            photos.save(
                storage = form.photo.data, # The uploaded file to save.
                name = new_photo.filename
            )

            print('New photo was uploded and added to database, its id is {0}'.format(new_photo.id))
            flash('New photo was uploded and added to database, its id is {0}.'.format(new_photo.id), category = 'succes')

            # cut the photo into chunks :
            chunks_numerotation, chunks_coords = new_photo.get_chunks_infos()
            for chunk_idx, chunk_coords in enumerate(chunks_coords) :
                new_chunk = Chunk(new_photo, chunks_numerotation[chunk_idx], chunk_coords)
                db.session.add(new_chunk)
            db.session.commit()
            # TODO get its URL
            # TODO print its URL

            print('To ease the annotation, the image has been split into {0} chunks. Its chunks were added to database.'.format(chunk_idx + 1))
            flash('To ease the annotation, the image has been split into {0} chunks. Its chunks were added to database.'.format(chunk_idx + 1), category = 'succes')

            return render_template('choice_after_upload.html', chunks_numerotation = chunks_numerotation )

        except Exception as e:
            # TODO : catch the different kind of exception that could occurred.
            print (e)
            db.session.rollback()
            print('An error occurred accessing the database.')
            flash('An error occurred accessing the database.', category = 'error')
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
            flash('Logged in successfully.', category='succes')
            print('Logged in successfully.')
            next = request.args.get('next')
            #TODO check that next is safe !
            # is_safe_url should check if the url is safe for redirects.
            # See http://flask.pocoo.org/snippets/62/ for an example.
            if not True :#is_safe_url(next):
                return flask.abort(400)
            return redirect(next or url_for('index'))
        else :
            flash ('Authentification failed', category='error')
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
    flash("Logged out successfully", category='succes')
    return redirect('/')

@app.route("/account")
def account():
    """
    View of the account page.
    """
    #TODO
    return render_template('account-page.html')

@app.route('/browse')
def browse():
    # list uploaded photo in db :
    photos = Photo.query.all()
    print (photos)

    chunks = []
    nb_annotations = [ list() for _ in range (len(photos))  ]

    for photo_idx, photo in enumerate(photos) :
        chunks.append ( Chunk.query.filter_by(id_photo=photo.id).all()  )

        for chunk in chunks[photo_idx] :
            count = Annotation.query.filter_by(
                id_photo = chunk.id_photo,
                col = chunk.col ,
                row = chunk.row
            ).count()
            print (count)
            nb_annotations[photo_idx].append(count)

    print(chunks)
    return render_template('browse.html', photos = photos, chunks = chunks , nb_annotations = nb_annotations, app = app , enumerate=enumerate)

@app.route('/download/<photo_id>')
def download(photo_id):
    #photo_id = secure_filename(photo_id)
    photo = Photo.query.get(photo_id) # Primary Key
    if os.path.isfile(photo.path): # if the file exists
        # send it :
        return send_file(photo.path, as_attachment=True)
    else:
        # return to the photo list with a flash error message
        print("Photo {photo_id} doesn't exists.".format(photo_id=photo_id))
        return redirect(url_for('browse'))


@app.route('/chunks/<int:photo_id>/<int:col>/<int:row>')
def get_chunk_url(photo_id, col, row):
    print('=====================================================')
    chunk = Chunk.query.get([photo_id, col, row]) # Primary Key
    print (chunk.filename)
    print (chunk.path)
    resp = make_response(open(chunk.path, 'rb').read()) #open in binary mode
    resp.content_type = "image/jpeg"
    return resp

@app.route('/chunks/<int:photo_id>/<int:col>/<int:row>/annotations/')
def get_chunk_annotation(photo_id, col, row):

    # get all the annotation that are made on current chunk :
    annotations = Annotation.query.filter_by(id_photo=photo_id, col = col, row = row).all()
    #query.with_entities(SomeModel.col1, SomeModel.col2) #select colum for the return

    # model is not JSON serializable
    # so we do it by the hand : #TODO : better way ?
    serialized_annotations = [ {key : e.__dict__[key] for key in ['id_photo', 'col', 'row', 'id', 'username','x','y','width','height', 'annotation'] } for e in annotations ]
    for e in serialized_annotations : print (e)


    return jsonify(serialized_annotations)



@app.route('/annotate_chunk/<int:photo_id>/<int:col>/<int:row>')
def annotate_chunk(photo_id, col, row):
    print(photo_id, col, row)
    chunk = Chunk.query.get([photo_id, col, row]) # Primary Key -> image_id, col, row

    # check if the requested chunk is on the disk :
    try :
        assert( os.path.exists( chunk.path ) )
    except AssertionError as e :
        print ("can't refer to the chunk on the disk")

    print ( url_for('get_chunk_url', photo_id=photo_id, col=col, row=row ) )


    # give the URL the requested file uploaded to this set would be accessed at. It doesn’t check whether said file exists.

    return render_template('annotate-chunk.html', photo_id=photo_id, col=col, row=row )


@app.route('/chunks/<int:photo_id>/<int:col>/<int:row>/annotations/' , methods = ['POST'])
@login_required
def add_anno(photo_id, col, row) :

    print (current_user)


    chunk = Chunk.query.get([photo_id, col, row]) # Primary Key -> image_id, col, row
    print (chunk)

    x =  request.form['x']
    y =  request.form['y']
    width =  request.form['width']
    height =  request.form['height']
    annotation =  request.form['new-list-item-text']

    new_anno = Annotation(
        current_user,
        chunk,
        x, y, width, height,
        annotation
    )

    print (new_anno)

    print (new_anno.username)
    print (new_anno.id_photo )
    print (new_anno.col)
    print (new_anno.row)
    print (new_anno.date )
    print (new_anno.x )
    print (new_anno.y )
    print (new_anno.width )
    print (new_anno.height )
    print (new_anno.annotation)

    try :
        db.session.add(new_anno)
        db.session.commit()
        print('New anno added to database')
    except Exception as e:
        print (e)
        db.session.rollback()
        print('An error occurred accessing the database.')
        redirect('/')

    return jsonify(new_anno.id)


@app.route('/update_anno_text' , methods = ['POST'])
def update_anno_text() :
    print(request.form['id'])
    print(request.form['value'])

    anno = Annotation.query.get( request.form['id'] )
    anno.annotation = request.form['value']
    print (anno.annotation)
    anno.date = datetime.datetime.utcnow().isoformat()
    #TODO : make the date update automatically when setting a field -> use setter decorator

    try :
        db.session.commit()
        print('anno was modified in the database')
        return '', 200

    except Exception as e:
        print (e)
        db.session.rollback()
        print('An error occurred accessing the database.')
        redirect('/')
        return '', 500



@app.route('/del_anno' , methods = ['DELETE'])
def del_anno() :
    print(request.form['id'])

    try :
        Annotation.query.filter_by(id= request.form['id'] ).delete()
        db.session.commit()
        print('anno was deleted drom the database')
        return '', 200

    except Exception as e:
        print (e)
        db.session.rollback()
        print('An error occurred accessing the database.')
        redirect('/')
        return '', 500

@app.route('/e-learning')
def choice_e_leaning_activity() :
    return render_template('choice-e-learning.html')
