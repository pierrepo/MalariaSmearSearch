.PHONY: run reset-all backup-data

DATE=$(shell date +"%Y-%m-%d")

# run the web server in the virtual environnement
run:
	. ./venv/bin/activate; \
	python __init__.py

# clean all data and reset database
reset-all:
	@echo "clean databases"
	rm -f data/data.db data/users.db

	@echo "clean samples"
	rm -f data/samples/*.jpg data/samples/*.jpeg data/samples/*.png

	@echo "clean chunks"
	rm -f data/chunks/*.jpg data/chunks/*.jpeg data/chunks/*.png

	@echo "build databases"
	. ./venv/bin/activate; \
	python3 setup-db.py; \
	deactivate


backup-data:
	tar zcvf data-backup-${DATE}.tgz data/samples/ data/chunks/ data/data.db data/users.db
