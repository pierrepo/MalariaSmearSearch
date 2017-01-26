"""
Define the forms used in the views.

Forms are defined using FlaskForm class of Flask-WTF module.
They have several fields defined, and a CSRF token hidden field that is created
automatically.
"""
from flask_wtf import FlaskForm
from wtforms.fields import TextField, BooleanField, PasswordField, RadioField, SubmitField, TextField, IntegerField
from wtforms.validators import Optional,  Required, Email, EqualTo, Length
from flask_uploads import UploadSet, IMAGES
from flask_wtf.file import FileField, FileAllowed, FileRequired

import app

class UploadForm(FlaskForm):
    """
    Form for image upload.
    """
    photo = FileField('photo', validators=[
        FileRequired(),
        FileAllowed( app.photos, 'Images only!')
    ])

    preparation_type = RadioField('Type of preparation', choices=[
            ('thick',  'Goutte Epaisse '),
            ('thin',  'Frotti'),
            ], validators=[Required()] )
    comment = TextField('Comment', validators=[ Length( max=256)])
    magnification =IntegerField ('magnification', validators=[Required()])
    microscope_model = TextField ('microscope_model',  validators=[Required()])

    submit = SubmitField('Upload image')


class LoginForm(FlaskForm):
    username = TextField('Username', validators=[Required(), Length(min=8, max=80)])
    password = PasswordField('Password', validators=[Required()])
    idle_ttl = RadioField('Idle Session Timeout', default='tmp', choices=[
            ('tmp',  '20 minutes'),
            ('day',  '8 hours (a normal business day)'),
            ('week', '8 days (Monday to Monday)'),
            ])
    submit = SubmitField('Login')


class ProfileForm(FlaskForm):
    email = TextField('Email Adress', validators=[Optional(), Email() ])
    password = PasswordField('New Password', validators=[
            Optional(),
            Length(min=8, max=80),
            EqualTo('confirm', message='Passwords must match')
            ])
    confirm = PasswordField('Repeat Password')

    submit = SubmitField('Update Profile')


class RegisterForm(FlaskForm):
    username = TextField('Username', validators=[Required(), Length(min=8, max=80)])

    email = TextField('Email Address', validators = [Required(), Email()])
    password = PasswordField('New Password', validators=[
            Required(),
            Length(min=8, max=80),
            EqualTo('confirm', message='Passwords must match')
    ])
    confirm = PasswordField('Repeat Password')
    accept_tos = BooleanField('I accept the TOS', validators = [Required()])

    submit = SubmitField('Register')
