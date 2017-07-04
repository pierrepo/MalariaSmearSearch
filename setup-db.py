from app import db
import model

db.create_all()
db.session.commit() # create all the tables that are in model

i_up7d = model.Institution ('up7d',  'Paris, France', 'Université Paris Diderot', 'https://www.univ-paris-diderot.fr/', '--')
i_ijm = model.Institution ('IJM',  'Paris, France', 'Institut Jacques Monod', 'http://www.ijm.fr/', '--')
i_fcrm = model.Institution ('FCRM',  'Brazzaville, République du Congo', 'Fondation Congolaise pour la Recherche Médicale ', 'http://www.fcrm-congo.com/', '--')

admin = model.User_auth()
admin.username = 'pierre'
admin.password = 'pierre123'
admin.primary_institution_name = i_up7d.name

for secondary_institution in (i_ijm, i_fcrm) :
    new_membership = model.Membership()
    new_membership.secondary_institution_name = secondary_institution.name
    admin.secondary_institutions.append(new_membership)

print(admin.secondary_institutions.all())

db.session.add(admin)
db.session.commit()


# put the User in data/data.db :
dat_user = model.User()
dat_user.username = admin.username
dat_user.primary_institution = i_up7d

db.session.add(dat_user)
db.session.commit()
