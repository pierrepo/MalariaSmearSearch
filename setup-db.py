from app import db
import model

db.create_all()
db.session.commit() # create all the tables that are in model

i_original = model.Institution ('original_institution',  'place o', 'description o', 'url o', 'comment o')
i_a = model.Institution ('up7d',  'place a', 'description a', 'url a', 'comment a')
i_b = model.Institution ('ijm',  'place b', 'description b', 'url b', 'comment b')


admin = model.User_auth()
admin.username = 'admin'
admin.password = 'admin123'
admin.primary_institution_name = i_original.name

for secondarary_institution in (i_a, i_b) :
    new_membership = model.Membership()
    new_membership.institution_name = secondarary_institution.name
    admin.secondary_institutions.append(new_membership)

print(admin.secondary_institutions.all())

db.session.add(admin)
db.session.commit()


# put the User in data.db :
dat_user = model.User()
dat_user.username = admin.username
dat_user.institution_primary = i_original

db.session.add(dat_user)
db.session.commit()
