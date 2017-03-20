from app import db
import model

db.create_all()
db.session.commit() # create all the tables that are in model

i_a = model.Institution ('up7d')
i_b = model.Institution ('ijm')

admin = model.User_auth()
admin.username = 'admin'
admin.password = 'admin123'

for institution in (i_a, i_b) :
    admin.institutions.append(institution)
    #  The original argument above is left at its default value of None.

# For those cases where we do want special_key to have a value, we create the UserKeyword object explicitly :
i_true = model.Membership(model.Institution('its_original'), admin, original=True)


print(admin.institutions)

db.session.add(admin)
db.session.commit()




# put the User in data.db :
dat_user = model.User()
dat_user.username = admin.username
dat_user.original_institution = admin.original_institution.name

db.session.add(dat_user)
db.session.commit()
