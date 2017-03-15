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

from app import app, login_manager, samples_set
from forms import RegisterForm, LoginForm, UploadForm
import new_model

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
    print (new_model.User_auth.query.filter(new_model.User_auth.username == username).first() )
    return new_model.User_auth.query.filter(new_model.User_auth.username == username).first()



@app.route('/restrictedarea')
@login_required
def test():
    """
    View test for a page restricted to logged in users.
    """
    return "here you are ! in a restricted area, oh my gosh"

@app.route('/samples/upload', methods=['GET'])
@login_required
def upload():
    """
    View of the page where logged in users can access the form to upload samples.
    """
    form = UploadForm()
    return render_template('upload.html', form = form)

@app.route('/samples/', methods=['POST'])
@login_required
def add_sample():
    form = UploadForm()

    if form.validate_on_submit() : # -> it is a POST request and it is valid

        # get the sample and its database attributes !
        new_sample = new_model.Sample()
        form.populate_obj(new_sample)
        new_sample.extension = form.sample.data.filename.split('.')[-1].lower()
        # lowercase because the samples set is made from the IMAGE set
        # that do use lowercase extensions.
        # https://pythonhosted.org/Flask-Uploads/#flaskext.uploads.IMAGES

        print (new_sample)
        print (form)

        try :
            # add the sample in the database :
            db.session.add(new_sample)
            db.session.commit()
            # call the reconstructor
            # and thus update the fields that need sample.id
            new_sample.init_on_load()

            # upload the sample
            # its name is the sample 00000id in the database
            samples_set.save(
                storage = form.sample.data, # The uploaded file to save.
                name = new_sample.filename
            )

            # get the number of pieces using integer division :
            # chunk dimensions are always BELOW Sample.MAX_CHUNK_SIZE px
            with Image.open(new_sample.path) as img :
                width, height = img.size
                print (width, height)
                new_sample.num_col = (width // new_model.Sample.MAX_CHUNK_SIZE) + 1
                new_sample.num_row = (height // new_model.Sample.MAX_CHUNK_SIZE) + 1
            new_sample.init_on_load()
            db.session.commit()

            # cut the sample into chunks :
            new_sample.make_chunks()

            return redirect( url_for('uploaded', sample_id = new_sample.id) )


        except Exception as e:
            # TODO : catch the different kind of exception that could occurred.
            print (e)
            db.session.rollback()
            print('An error occurred accessing the database.')
            flash('An error occurred accessing the database.', category = 'error')
            return redirect( url_for('index') )


@app.route('/samples/<int:sample_id>/uploaded', methods=['GET'])
@login_required
def uploaded(sample_id):

    new_sample = new_model.Sample.query.get(sample_id)
    new_sample.init_on_load()

    print('New sample was uploded and added to database, its id is {0}'.format(new_sample.id))
    flash('New sample was uploded and added to database, its id is {0}.'.format(new_sample.id), category = 'succes')

    print('To ease the annotation, the image has been split into {0} chunks. Its chunks were added to database.'.format(new_sample.num_col * new_sample.num_row))
    flash('To ease the annotation, the image has been split into {0} chunks. Its chunks were added to database.'.format(new_sample.num_col * new_sample.num_row), category = 'succes')

    return render_template('choice_after_upload.html', sample = new_sample )


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
            new_user = new_model.User_auth()
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
                return redirect(url_for('index'))

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
        user = new_model.User_auth.query.filter_by(username=form.username.data).first()
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
    return redirect(url_for('index'))

@app.route("/account")
def account():
    """
    View of the account page.
    """
    #TODO
    return render_template('account-page.html')

@app.route('/samples/')
def browse():
    # list uploaded sample in db :
    samples = new_model.Sample.query.all()
    [sample.init_on_load() for sample in samples]
    print (samples)

    nb_annotations = [ list() for _ in range (len(samples))  ]

    for sample_idx, sample in enumerate(samples) :
        for (chunk_col, chunk_row) in sample.chunks_numerotation :
            count = new_model.Annotation.query.filter_by(
                sample_id = sample.id,
                col = chunk_col,
                row = chunk_row
            ).count()
            print (count)
            nb_annotations[sample_idx].append(count)

    colnames=['sample id', 'date upload', 'user', 'row idx', 'col idx', 'total number of annnotations', 'number of annotated parasites', 'date of the first annotation', 'date of the last annotation']

    rows = []
    for sample_idx, sample in enumerate (samples) :

        for (chunk_col, chunk_row) in sample.chunks_numerotation :

            chunk_anno = sample.annotations.filter(new_model.Annotation.col==chunk_col, new_model.Annotation.row==chunk_row)
            tot_num_anno = chunk_anno.count()
            num_para = sum(anno.annotation.startswith("P") for anno in chunk_anno)
            try:
                first_anno_date = min(anno.date for anno in chunk_anno)
                last_anno_date = max(anno.date for anno in chunk_anno)
            except (ValueError, TypeError):
                print('empty datetime list')
                first_anno_date = None
                last_anno_date = None

            row = [
                sample.id,
                None,
                sample.username,
                chunk_row,
                chunk_col,
                tot_num_anno,
                num_para,
                first_anno_date,
                last_anno_date
            ]
            print (row)
            print('=============================================')

            rows.append(row)

    return render_template('browse.html', samples = samples, nb_annotations = nb_annotations, colnames = colnames, rows = rows, enumerate=enumerate)

@app.route('/samples/<int:sample_id>')
def download(sample_id):
    #sample_id = secure_filename(sample_id)
    sample = new_model.Sample.query.get(sample_id) # Primary Key
    sample.init_on_load()
    if os.path.isfile(sample.path): # if the file exists
        # send it :
        return send_file(sample.path, as_attachment=True)
    else:
        # return to the sample list with a flash error message
        print("Sample {sample_id} doesn't exists.".format(sample_id=sample_id))
        return redirect(url_for('browse'))


@app.route('/samples/<int:sample_id>/chunks/<int:col>/<int:row>')
def get_chunk_url(sample_id, col, row):
    sample = new_model.Sample.query.get(sample_id) # Primary Key
    sample.init_on_load()
    chunk_path = sample.get_chunk_path(col, row)
    resp = make_response(open(chunk_path, 'rb').read()) #open in binary mode
    resp.content_type = "image/jpeg"
    return resp

@app.route('/samples/<int:sample_id>/chunks/<int:col>/<int:row>/annotations/')
def get_chunk_annotation(sample_id, col, row):

    # get all the annotation that are made on current chunk :
    annotations = new_model.Annotation.query.filter_by(sample_id=sample_id, col = col, row = row).all()
    #query.with_entities(SomeModel.col1, SomeModel.col2) #select colum for the return

    # model is not JSON serializable
    # so we do it by the hand : #TODO : better way ?
    serialized_annotations = [ {key : e.__dict__[key] for key in ['sample_id', 'col', 'row', 'id', 'username','x','y','width','height', 'annotation'] } for e in annotations ]
    for e in serialized_annotations : print (e)


    return jsonify(serialized_annotations)

@app.route('/about')
def about() :
    return render_template ('about.html')


@app.route('/samples/<int:sample_id>/chunks/<int:col>/<int:row>/annotate/')
def annotate_chunk(sample_id, col, row):
    print(sample_id, col, row)
    sample = new_model.Sample.query.get(sample_id)
    sample.init_on_load()
    chunk_path = sample.get_chunk_path(col, row)

    # check if the requested chunk is on the disk :
    try :
        assert( os.path.exists( chunk_path ) )
    except AssertionError as e :
        print ("can't refer to the chunk on the disk")

    print ( url_for('get_chunk_url', sample_id=sample_id, col=col, row=row ) )


    # give the URL the requested file uploaded to this set would be accessed at. It doesn’t check whether said file exists.

    return render_template('annotate-chunk.html', sample_id=sample_id, col=col, row=row )


@app.route('/samples/<int:sample_id>/chunks/<int:col>/<int:row>/annotations/' , methods = ['POST'])
@login_required
def add_anno(sample_id, col, row) :

    print (current_user)


    sample = new_model.Sample.query.get(sample_id)
    sample.init_on_load()

    x =  request.form['x']
    y =  request.form['y']
    width =  request.form['width']
    height =  request.form['height']
    annotation =  request.form['new-list-item-text']

    new_anno = new_model.Annotation(
        current_user,
        sample,
        (col, row),
        x, y, width, height,
        annotation
    )

    print (new_anno)

    print (new_anno.username)
    print (new_anno.sample_id )
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
        return redirect(url_for('index'))

    return jsonify(new_anno.id)


@app.route('/samples/<int:sample_id>/chunks/<int:col>/<int:row>/annotations/<int:anno_id>' , methods = ['POST'])
def update_anno_text(sample_id, col, row, anno_id) :
    print(anno_id)
    print(request.form['new_value'])

    anno = new_model.Annotation.query.get(anno_id)
    anno.annotation = request.form['new_value']
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
        return '', 500



@app.route('/samples/<int:sample_id>/chunks/<int:col>/<int:row>/annotations/<int:anno_id>' , methods = ['DELETE'])
def del_anno(sample_id, col, row, anno_id) :
    print(anno_id)

    try :
        new_model.Annotation.query.filter_by(id=anno_id).delete()
        db.session.commit()
        print('anno was deleted drom the database')
        return '', 200

    except Exception as e:
        print (e)
        db.session.rollback()
        print('An error occurred accessing the database.')
        return '', 500
