FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -r backend/requirements.txt && pip install -e .
RUN apt-get update && apt-get install -y nodejs npm && \
    cd frontend && npm install && npm run build && \
    cp -r out ../backend/static
EXPOSE 8000
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
