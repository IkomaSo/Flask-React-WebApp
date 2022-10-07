from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_bootstrap import Bootstrap
from flask_moment import Moment
from flask_jwt_extended import JWTManager
from elasticsearch import Elasticsearch
from datetime import datetime

app     = Flask(__name__)
app.config.from_object(Config)
app.config["JWT_SECRET_KEY"] = "STRONG_PASSWORD"
jwt = JWTManager(app)

db      = SQLAlchemy(app)
migrate = Migrate(app, db)
login   = LoginManager(app)
login.login_view = 'login'
bootstrap = Bootstrap(app)
moment = Moment(app)
app.elasticsearch = Elasticsearch([app.config['ELASTICSEARCH_URL']]) \
        if app.config['ELASTICSEARCH_URL'] else None

from app import routes, models
