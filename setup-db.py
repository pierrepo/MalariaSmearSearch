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

# For those cases where we do want special_key to have a value, we create the UserKeyword object explicitly :
i_true = new_model.Membership(new_model.Institution('its_original'), admin, original=True)


print(admin.institutions)

db.session.add(admin)
db.session.commit()
