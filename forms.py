"""
Define the forms used in the views.

Forms are defined using FlaskForm class of Flask-WTF module.
They have several fields defined, and a CSRF token hidden field that is created
automatically.
"""
from flask_wtf import FlaskForm
from wtforms.fields import TextField, BooleanField, PasswordField, RadioField, SubmitField, TextField, IntegerField, TextAreaField
from wtforms.validators import Optional,  Required, Email, EqualTo, Length
from flask_wtf.html5 import NumberInput
from flask_uploads import UploadSet, IMAGES
from flask_wtf.file import FileField, FileAllowed, FileRequired

import app

class UploadForm(FlaskForm):
    """
    Form for image upload.
    """
    sample = FileField('sample', validators=[
        FileRequired(),
        FileAllowed( app.samples_set, 'Images only!')
    ])

    smear_type = RadioField('Blood smear type', choices=[
            ('thick',  'Thick'),
            ('thin',  'Thin')
            ], validators=[Required()] )
    comment = TextAreaField('Comment', render_kw={"placeholder": "URL, legend, etc...", "rows": 3, "cols": 70})
    license = RadioField('License', choices=[
            ('CC0',  'CC0 / PD : Freeing content globally without restrictions'),
            ('BY',  'CC-BY : Attribution alone'),
            ('BY-SA',  'CC-BY-SA : Attribution + ShareAlike')
            ], validators=[Required()] )
    provider = TextAreaField('Provider', render_kw={"rows": 3, "cols": 70})
    magnification =IntegerField ('Magnification', widget=NumberInput(), render_kw={"placeholder": "e.g. 100"})
    patient_ref = TextField('Patient reference', validators=[Length(max=50)])

    submit = SubmitField('Upload image')


class LoginForm(FlaskForm):
    """
    Form for user login.
    """
    username = TextField('Username', validators=[Required(), Length(min=5, max=80)])
    password = PasswordField('Password', validators=[Required()])
    idle_ttl = RadioField('Idle Session Timeout', default='tmp', choices=[
            ('tmp',  '20 minutes'),
            ('day',  '8 hours (a normal business day)'),
            ('week', '8 days (Monday to Monday)'),
            ])
    submit = SubmitField('Login')


class ProfileForm(FlaskForm):
    """
    For for the user to change infos of his own account.
    """
    email = TextField('Email Adress', validators=[Optional(), Email() ])
    password = PasswordField('New Password', validators=[
            Optional(),
            Length(min=8, max=80),
            EqualTo('confirm', message='Passwords must match')
            ])
    confirm = PasswordField('Repeat Password')

    submit = SubmitField('Update Profile')


class RegisterForm(FlaskForm):
    """
    For for new user registration.
    """
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
