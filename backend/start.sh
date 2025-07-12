#!/bin/sh

# run setup
. .venv/bin/activate

python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# start server
exec uvicorn rewear.asgi:application --host 0.0.0.0 --port 8000

