#! /usr/bin/env bash

echo "clean databases"
rm -f data.db users.db

echo "clean samples"
rm -f samples/*{.jpg,.jpeg,.png}

echo "clean chunks"
rm -f chunks/*{.jpg,.jpeg,.png}

echo "build databases"
python3 setup-db.py

