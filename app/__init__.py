from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.debug = True
    app.config.from_object('config.Config')
    db.init_app(app)

    # 注册路由蓝图
    from .routes import bp
    app.register_blueprint(bp)

    with app.app_context():
        db.create_all()  # 初始化数据库
    return app
