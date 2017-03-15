from app import db
import new_model

db.create_all()
db.session.commit() # create all the tables that are in model

i_a = new_model.Institution ('up7d')
i_b = new_model.Institution ('ijm')

admin = new_model.User_auth()
admin.username = 'admin'
admin.password = 'admin123'

for institution in (i_a, i_b) :
    admin.institutions.append(institution)

print(admin.institutions)

db.session.add(admin)
db.session.commit()
