from flask import Blueprint, jsonify, request
from ..utils.db import db
from ..utils.email_sender import generate_verification_code, send_verification_email
from datetime import datetime, timedelta
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
            
            # Öğretmen adını al
            ogretmen = db.users.find_one({"mail": course.get('ogretmenMail')})
            ogretmen_adi = f"{ogretmen['ad']} {ogretmen['soyad']}" if ogretmen else course.get('ogretmenMail')
            
            # Katılım durumunu katilanlar dizisinden kontrol et
            katilim_yapildi = ogrno in course.get('katilanlar', [])
            
            formatted_course = {
                '_id': course_id,
                'dersKodu': course['dersKodu'],
                'dersAdi': course['dersAdi'],
                'katilimYapildi': katilim_yapildi,
                'ogretmenler': [ogretmen_adi],
                'tarih': course.get('tarih')
            }
            
            formatted_courses.append(formatted_course)
        
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

@attendance_routes.route('/student-tracking/<ogrno>', methods=['GET'])
def get_student_tracking(ogrno):
    try:
        # Öğrencinin tüm derslerini bul
        all_courses = list(db.attendance.find({
            "tumOgrenciler": ogrno
        }).distinct("dersKodu"))
        
        tracking_data = []
        
        for ders_kodu in all_courses:
            # Her ders için yoklama verilerini topla
            dersler = list(db.attendance.find({
                "dersKodu": ders_kodu,
                "tumOgrenciler": ogrno
            }))
            
            if dersler:
                toplam_ders = len(dersler)
                katildigi_ders = sum(1 for ders in dersler if ogrno in ders.get('katilanlar', []))
                katilmadigi_ders = toplam_ders - katildigi_ders
                katilim_orani = round((katildigi_ders / toplam_ders) * 100) if toplam_ders > 0 else 0
                
                tracking_data.append({
                    "dersKodu": ders_kodu,
                    "dersAdi": dersler[0].get('dersAdi', ''),
                    "toplamDers": toplam_ders,
                    "katildigiDers": katildigi_ders,
                    "katilmadigiDers": katilmadigi_ders,
                    "katilimOrani": katilim_orani
                })
        
        return jsonify(tracking_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 

@attendance_routes.route('/teacher-tracking/<teacher_mail>/<course_code>', methods=['GET'])
def get_teacher_tracking(teacher_mail, course_code):
    try:
        print(f"[DEBUG] Öğretmen devamsızlık takibi isteği - Öğretmen: {teacher_mail}, Ders: {course_code}")
        
        # Önce dersi bul
        course = db.courses.find_one({
            "dersKodu": course_code,
            "ogretmenler": teacher_mail
        })
        print(f"[DEBUG] Ders bulundu mu: {course is not None}")
        
        if not course:
            print("[DEBUG] Ders bulunamadı")
            return jsonify([])
            
        # Dersin tüm yoklama kayıtlarını bul
        all_attendance = list(db.attendance.find({
            "dersKodu": course_code,
            "ogretmenMail": teacher_mail
        }))
        print(f"[DEBUG] Bulunan yoklama kayıtları: {len(all_attendance)}")
        
        if not all_attendance:
            print("[DEBUG] Yoklama kaydı bulunamadı")
            return jsonify([])
            
        tracking_data = []
        
        # Her öğrenci için devamsızlık verilerini hesapla
        for ogrenci_no in course['ogrenciler']:
            print(f"[DEBUG] Öğrenci işleniyor: {ogrenci_no}")
            
            # Öğrenci bilgilerini al
            ogrenci = db.users.find_one({"ogrno": ogrenci_no})
            if not ogrenci:
                print(f"[DEBUG] Öğrenci bulunamadı: {ogrenci_no}")
                continue
                
            # Öğrencinin katıldığı dersleri say
            toplam_ders = len(all_attendance)
            katildigi_ders = sum(1 for ders in all_attendance if ogrenci_no in ders.get('katilanlar', []))
            katilmadigi_ders = toplam_ders - katildigi_ders
            katilim_orani = round((katildigi_ders / toplam_ders) * 100) if toplam_ders > 0 else 0
            
            print(f"[DEBUG] Öğrenci {ogrenci_no} - Toplam: {toplam_ders}, Katıldı: {katildigi_ders}, Katılmadı: {katilmadigi_ders}, Oran: {katilim_orani}")
            
            tracking_data.append({
                "ogrenciNo": ogrenci_no,
                "adSoyad": f"{ogrenci['ad']} {ogrenci['soyad']}",
                "toplamDers": toplam_ders,
                "katildigiDers": katildigi_ders,
                "katilmadigiDers": katilmadigi_ders,
                "katilimOrani": katilim_orani
            })
        
        print(f"[DEBUG] Toplam {len(tracking_data)} öğrenci verisi döndürülüyor")
        return jsonify(tracking_data)
        
    except Exception as e:
        print(f"[HATA] Öğretmen devamsızlık takibi hatası: {str(e)}")
        return jsonify({'error': str(e)}), 500 

@attendance_routes.route('/send-verification-email', methods=['POST'])
def send_verification_email_route():
    try:
        data = request.get_json()
        if not data or 'email' not in data:
            return jsonify({'error': 'E-posta adresi gerekli'}), 400
            
        # Doğrulama kodu oluştur
        verification_code = generate_verification_code()
        
        # Kodu veritabanına kaydet (5 dakika geçerli)
        db.verification_codes.insert_one({
            'email': data['email'],
            'code': verification_code,
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(minutes=5)
        })
        
        # E-postayı gönder
        if send_verification_email(data['email'], verification_code):
            return jsonify({'message': 'Doğrulama kodu gönderildi'})
        else:
            return jsonify({'error': 'E-posta gönderilemedi'}), 500
            
    except Exception as e:
        print(f"E-posta gönderme hatası: {e}")
        return jsonify({'error': str(e)}), 500

@attendance_routes.route('/verify-email-code', methods=['POST'])
def verify_email_code():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'code' not in data:
            return jsonify({'error': 'E-posta ve kod gerekli'}), 400
            
        # Kodu kontrol et
        verification = db.verification_codes.find_one({
            'email': data['email'],
            'code': data['code'],
            'expires_at': {'$gt': datetime.now()}
        })
        
        if verification:
            # Kullanılmış kodu sil
            db.verification_codes.delete_one({'_id': verification['_id']})
            return jsonify({'message': 'Kod doğrulandı'})
        else:
            return jsonify({'error': 'Geçersiz veya süresi dolmuş kod'}), 400
            
    except Exception as e:
        print(f"Kod doğrulama hatası: {e}")
        return jsonify({'error': str(e)}), 500 