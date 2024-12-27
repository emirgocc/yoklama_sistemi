from flask import Blueprint, request, jsonify
from ..utils.db import db

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Gerekli alanları kontrol et
        if not data or 'mail' not in data or 'sifre' not in data:
            return jsonify({'error': 'Mail ve şifre gerekli'}), 400
        
        print(f"Gelen istek: {data}")  # Debug için
        
        # Kullanıcıyı bul
        user = db.users.find_one({
            'mail': data['mail'],
            'sifre': data['sifre']
        })
        
        print(f"Bulunan kullanıcı: {user}")  # Debug için
        
        if user:
            return jsonify({
                'message': 'Giriş başarılı',
                'user': {
                    'mail': user['mail'],
                    'role': user['role'],
                    'ad': user['ad'],
                    'soyad': user['soyad']
                }
            })
        
        return jsonify({'error': 'Geçersiz mail veya şifre'}), 401
        
    except Exception as e:
        print(f"Login hatası: {e}")  # Debug için
        return jsonify({'error': f'Sunucu hatası: {str(e)}'}), 500