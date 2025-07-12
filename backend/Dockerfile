FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --upgrade pip && pip install uv
COPY . /app
RUN uv sync

ENV PATH="/app/.venv/bin:$PATH"

RUN python manage.py collectstatic --noinput

CMD ["uvicorn", "rewear.asgi:application", "--host", "0.0.0.0", "--port", "8000"]
