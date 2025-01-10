from flask import Blueprint, request, jsonify
from ..utils.db import db

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = db.users.find_one({"mail": data['mail'], "sifre": data['sifre']})
        
        if user:
            # Tüm gerekli kullanıcı bilgilerini gönder
            return jsonify({
                'message': 'Giriş başarılı',
                'user': {
                    'mail': user['mail'],
                    'role': user['role'],
                    'ad': user['ad'],
                    'soyad': user['soyad'],
                    'ogrno': user.get('ogrno'),  # Öğrenci numarasını da ekle
                    'telno': user.get('telno')   # Telefon numarasını da ekle
                }
            })
        else:
            return jsonify({'error': 'Geçersiz kullanıcı adı veya şifre'}), 401
            
    except Exception as e:
        print(f"Login hatası: {e}")
        return jsonify({'error': str(e)}), 500