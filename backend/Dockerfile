FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --upgrade pip && pip install uv

COPY pyproject.toml .
RUN uv sync

COPY . /app

RUN chmod +x /app/start.sh

CMD ["/bin/sh", "/app/start.sh"]
