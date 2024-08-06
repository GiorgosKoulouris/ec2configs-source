FROM python:3-alpine

WORKDIR /app
COPY . .
RUN ["python", "-m" , "pip", "install", "-r", "requirements.txt"]

LABEL maintainer="George Koulouris <gkoulouris@thecanopener.com>"
LABEL version="1.0.0"
LABEL project="EC2 Configs"

ENTRYPOINT ["./entrypoint.sh"]