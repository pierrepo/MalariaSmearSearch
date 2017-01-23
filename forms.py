from flask_wtf import FlaskForm
from wtforms.fields import TextField, BooleanField, PasswordField, RadioField, SubmitField, TextField
from wtforms.validators import Optional,  Required, Email, EqualTo, Length
    


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
