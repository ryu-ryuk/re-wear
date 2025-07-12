.PHONY: run migrate makemigrations shell superuser up down build

run:
	uvicorn rewear.asgi:application --host 0.0.0.0 --port 8000 --reload

migrate:
	python manage.py migrate

makemigrations:
	python manage.py makemigrations

collectstatic:
	python manage.py collectstatic --noinput

shell:
	python manage.py shell

superuser:
	python manage.py createsuperuser

up:
	make collectstatic
	docker compose up --watch

down:
	docker compose down

build:
	docker compose build


