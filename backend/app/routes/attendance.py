from flask import Blueprint, jsonify
from ..utils.db import db
from datetime import datetime
from bson import ObjectId

attendance_routes = Blueprint('attendance', __name__)

@attendance_routes.route('/active-courses/<ogrno>', methods=['GET'])
def get_active_courses(ogrno):
    try:
        print(f"[DEBUG] Öğrenci no: {ogrno} için aktif dersler getiriliyor")
        
        # Aktif dersleri getir
        active_courses = list(db.attendance.find({
            "durum": "aktif",
            "tumOgrenciler": ogrno
        }))
        
        # Her ders için katılım durumunu kontrol et
        formatted_courses = []
        for course in active_courses:
            course_id = str(course['_id'])
            
            # Katılım durumunu katilanlar dizisinden kontrol et
            katilim_yapildi = ogrno in course.get('katilanlar', [])
            
            print(f"[DEBUG] Ders {course_id} için katılım durumu: {katilim_yapildi}")
            
            formatted_course = {
                '_id': course_id,
                'dersKodu': course['dersKodu'],
                'dersAdi': course['dersAdi'],
                'katilimYapildi': katilim_yapildi
            }
            formatted_courses.append(formatted_course)
            
            print(f"[DEBUG] Formatlanmış ders bilgisi: {formatted_course}")
        
        return jsonify(formatted_courses)
        
    except Exception as e:
        print(f"[HATA] Aktif dersler getirme hatası: {str(e)}")
        return jsonify({'error': str(e)}), 500

@attendance_routes.route('/verify-attendance/<ders_id>/<ogrno>', methods=['POST'])
def verify_attendance(ders_id, ogrno):
    try:
        # Dersi bul ve öğrenciyi katilanlar listesine ekle
        result = db.attendance.update_one(
            {"_id": ObjectId(ders_id)},
            {"$addToSet": {"katilanlar": ogrno}}
        )
        
        if result.modified_count > 0:
            print(f"[DEBUG] Öğrenci {ogrno} dersin katılımcılarına eklendi")
            return jsonify({"message": "Yoklama kaydı başarılı"}), 200
        else:
            print(f"[DEBUG] Öğrenci zaten katılımcılarda var veya güncelleme başarısız")
            return jsonify({"message": "Bu ders için zaten yoklama kaydınız var"}), 200
            
    except Exception as e:
        print(f"[HATA] Yoklama kaydı hatası: {str(e)}")
        return jsonify({'error': str(e)}), 500 