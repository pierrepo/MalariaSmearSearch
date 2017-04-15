.PHONY: run reset-all backup_data

DATE=$(shell date +"%Y-%m-%d")

# run the web server in the virtual environnement
run:
	. ./venv/bin/activate; \
	python __init__.py

# clean all data and reset database
reset-all:
	@echo "clean databases"
	rm -f data.db users.db

	@echo "clean samples"
	rm -f samples/*{.jpg,.jpeg,.png}

	@echo "clean chunks"
	rm -f chunks/*{.jpg,.jpeg,.png}

	@echo "build databases"
	. ./venv/bin/activate; \
	python3 setup-db.py; \
	deactivate


backup-data:
	tar zcvf data-backup-${DATE}.tgz samples/ chunks/ data.db users.db
