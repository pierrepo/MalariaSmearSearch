# MalariaSmearSearch

*MalariaSmearSearch* is a database of blood smears used in malaria diagnosis.


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

		python setup-db.py

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

		python __init__.py

7. Open web browser at <http://127.0.0.1:5000/>

8. Kill web app

		ctrl-c

9. Quit virtualenv

		deactivate
