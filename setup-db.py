from app import db
import new_model

db.create_all()
db.session.commit() # create all the tables that are in model

admin = new_model.User_auth()
admin.username = 'admin'
admin.password = 'admin123'
admin.level = 'admin'
admin.institution = 'up7d'

db.session.add(admin)
db.session.commit()
