FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --upgrade pip && pip install uv
COPY . /app
RUN uv sync

RUN chmod +x /app/start.sh

CMD ["/bin/sh", "/app/start.sh"]

