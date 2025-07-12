build:
	docker compose build

up:
	docker compose up 

down:
	docker compose down

restart:
	docker compose down && docker compose up --build

logs:
	docker compose logs -f

shell:
	docker compose exec backend sh

migrate:
	docker compose exec backend .venv/bin/python manage.py migrate

collectstatic:
	docker compose exec backend .venv/bin/python manage.py collectstatic --noinput

createsuperuser:
	docker compose exec backend .venv/bin/python manage.py createsuperuser
test:
	docker compose exec backend .venv/bin/python manage.py create_sample_items --count=20

