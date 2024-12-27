from flask import Blueprint, jsonify
from ..utils.db import db

courses = Blueprint('courses', __name__)

@courses.route('/teacher/<mail>', methods=['GET'])
def get_teacher_courses(mail):
    try:
        print(f"Aranan öğretmen maili: {mail}")  # Debug log
        
        # Tüm dersleri kontrol et
        all_courses = list(db.courses.find())
        print(f"Veritabanındaki tüm dersler: {all_courses}")  # Debug log
        
        # Öğretmenin verdiği dersleri getir
        teacher_courses = list(db.courses.find(
            {"ogretmenler": mail},
            {"_id": 1, "dersKodu": 1, "dersAdi": 1}
        ))
        print(f"Bulunan öğretmen dersleri: {teacher_courses}")  # Debug log
        
        # Frontend'in beklediği formata dönüştür
        formatted_courses = [{
            "_id": str(course["_id"]),
            "kod": course["dersKodu"],
            "ad": course["dersAdi"]
        } for course in teacher_courses]
        
        print(f"Frontend'e gönderilen dersler: {formatted_courses}")  # Debug log
        
        return jsonify({
            'courses': formatted_courses
        })
        
    except Exception as e:
        print(f"Ders getirme hatası: {e}")
        return jsonify({'error': str(e)}), 500