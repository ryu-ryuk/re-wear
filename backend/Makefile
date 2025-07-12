.PHONY: run migrate makemigrations shell superuser up down build

run:
	uvicorn rewear.asgi:application --host 0.0.0.0 --port 8000 --reload

migrate:
	python manage.py migrate

makemigrations:
	python manage.py makemigrations

shell:
	python manage.py shell

superuser:
	python manage.py createsuperuser

up:
	docker-compose up --build

down:
	docker-compose down

build:
	docker-compose build

