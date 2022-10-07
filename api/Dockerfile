FROM python:slim

RUN useradd task2_api

WORKDIR /home/task2_api

COPY requirements.txt requirements.txt
RUN python -m venv venv
RUN venv/bin/pip install -r requirements.txt
RUN venv/bin/pip install gunicorn pymysql cryptography

COPY app app
COPY migrations migrations
COPY task2.py config.py boot.sh ./
RUN chmod +x boot.sh

ENV FLASK_APP task2.py

RUN chown -R task2_api:task2_api ./
USER task2_api

EXPOSE 5000
ENTRYPOINT ["./boot.sh"]