# MalariaSmearSearch

## Setup

1. Get files

	git clone https://github.com/pierrepo/MalariaSmearSearch.git
	cd MalariaSmearSearch

1. Install virtualenv

	sudo pip3 install virtualenv

2. Create virtual environment

	virtualenv -p /usr/bin/python3 venv

3. Activate virtualenv

	source venv/bin/activate

4. Install requirements

	pip install -r requirements.txt

5. Initialize database

	sqlite3 test.db
	sqlite> .read setup-db-test.sql

6. Quit virtualenv

	deactivate


## Usage

1. Update project repository

	git pull

2. Activate virtualenv

	source venv/bin/activate

3. Update requirements

	pip install -r requirements.txt

4. Run Python webserver

	???

7. Open web browser at <http://127.0.0.0:????>

8. Kill web app

	???

9. Quit virtualenv

	deactivate
