import face_recognition
import numpy as np
import cv2

def process_face_image(file_stream):
    """
    Gelen dosya akışını (file stream) işler, yüzü bulur ve kodlamasını döner.

    Args:
        file_stream: request.files['file']'dan gelen dosya nesnesi.

    Returns:
        Başarılı olursa (list): 128 elemanlı yüz kodlama listesi.
        Başarısız olursa (tuple): (Hata mesajı, HTTP status kodu)
    """
    try:
        # 1. Dosyayı oku ve görüntüye çevir
        in_memory_file = file_stream.read()
        np_arr = np.frombuffer(in_memory_file, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            return "Geçersiz resim formatı veya bozuk dosya.", 400

        # Görüntüyü RGB formatına çevir
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # 2. Yüzleri tespit et
        face_locations = face_recognition.face_locations(rgb_image, model="hog")

        if not face_locations:
            return "Yüklenen fotoğrafta yüz bulunamadı.", 400
        if len(face_locations) > 1:
            return "Fotoğrafta birden fazla yüz bulundu. Lütfen tek bir yüz içeren fotoğraf yükleyin.", 400
        
        # 3. Yüz kodlamasını (encoding) çıkar ve Python listesi olarak döndür
        face_encoding_array = face_recognition.face_encodings(rgb_image, face_locations)[0]
        
        return face_encoding_array.tolist()

    except Exception as e:
        print(f"Yüz işleme sırasında beklenmedik bir hata: {e}")
        return "Görüntü işlenirken bir sunucu hatası oluştu.", 500