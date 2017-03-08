from app import db
from model import User

db.create_all()

admin = User()
admin.username = 'admin'
admin.password = 'admin123'
admin.level = 'admin'
admin.institution = 'up7d'

db.session.add(admin)
db.session.commit()
