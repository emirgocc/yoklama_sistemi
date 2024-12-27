from flask import Flask
from flask_cors import CORS
from .routes.auth import auth

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Blueprint'leri kaydet
    app.register_blueprint(auth, url_prefix='/api/auth')
    
    return app