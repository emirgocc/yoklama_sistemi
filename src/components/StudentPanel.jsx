import React, { useState, useEffect } from "react";

const StudentPanel = ({ user, onLogout }) => {
  const [activeCourses, setActiveCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSmsVerified, setIsSmsVerified] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  const fetchActiveCourses = async () => {
    try {
      console.log("[DEBUG] Aktif dersler isteniyor...");
      console.log("[DEBUG] Kullanıcı bilgileri:", user);
      
      if (!user || !user.ogrno) {
        console.log("[HATA] Kullanıcı bilgileri eksik!");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/attendance/active-courses/${user.ogrno}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("[DEBUG] API yanıtı:", response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("[DEBUG] Backend'den gelen dersler ve katılım durumları:", data);
      data.forEach(course => {
        console.log(`[DEBUG] ${course.dersKodu}: katilimYapildi = ${course.katilimYapildi}`);
      });
      
      setActiveCourses(data);
      
    } catch (error) {
      console.error('[HATA] Aktif dersler yüklenirken hata:', error);
      setAlertMessage({
        severity: "error",
        text: "Aktif dersler yüklenirken bir hata oluştu."
      });
    }
  };

  useEffect(() => {
    fetchActiveCourses();
  }, [user]);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setIsAuthenticated(false);
    setShowPopup(true);
    setAlertMessage(null);
    setIsSmsVerified(false);
    setIsFaceVerified(false);
  };

  const handleSmsVerification = () => {
    setIsSmsVerified(true);
    setAlertMessage({
      severity: "success",
      text: "SMS doğrulaması başarıyla tamamlandı.",
    });
  };

  const handleFaceVerification = () => {
    setIsFaceVerified(true);
    setAlertMessage({
      severity: "success",
      text: "Yüz tanıma doğrulaması başarıyla tamamlandı.",
    });
  };

  const handleAuthentication = async () => {
    if (isSmsVerified && isFaceVerified) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/attendance/verify-attendance/${selectedCourse._id}/${user.ogrno}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.ok) {
          setIsAuthenticated(true);
          setShowPopup(false);
          
          await fetchActiveCourses();
          
          setAlertMessage({
            severity: "success",
            text: `${selectedCourse.dersAdi} dersine başarıyla giriş yaptınız.`
          });
        } else {
          throw new Error('Yoklama kaydı başarısız');
        }
      } catch (error) {
        setAlertMessage({
          severity: "error",
          text: "Yoklama kaydı yapılırken hata oluştu: " + error.message
        });
      }
    } else {
      setAlertMessage({
        severity: "warning",
        text: "Lütfen tüm doğrulamaları tamamlayın."
      });
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setIsSmsVerified(false);
    setIsFaceVerified(false);
    setAlertMessage(null);
  };

  const clearAlert = () => {
    setAlertMessage(null);
  };

  return (
    <>
      <p className="subtitle has-text-centered mb-4">
        Merhaba, {user.username}
      </p>

      <h2 className="title is-5 has-text-centered mb-4">
        <span className="icon-text">
          <span className="icon">
            <i className="fas fa-book"></i>
          </span>
          <span>Aktif Dersler</span>
        </span>
      </h2>

      {activeCourses.length === 0 ? (
        <div className="notification is-info is-light has-text-centered">
          <span className="icon-text">
            <span className="icon">
              <i className="fas fa-info-circle"></i>
            </span>
            <span>Aktif dersiniz bulunmamaktadır.</span>
          </span>
        </div>
      ) : (
        <div className="list has-hoverable-list-items">
          {activeCourses.map((course) => (
            <div key={course._id} className="list-item">
              <div className="level is-mobile">
                <div className="level-left">
                  <div className="level-item">
                    <span>{course.dersKodu} - {course.dersAdi}</span>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <button
                      className={`button ${course.katilimYapildi ? 'is-light' : 'is-primary'}`}
                      onClick={() => handleCourseSelect(course)}
                      disabled={course.katilimYapildi}
                      style={course.katilimYapildi ? {
                        backgroundColor: '#f5f5f5',
                        color: '#7a7a7a'
                      } : {}}
                    >
                      {course.katilimYapildi ? 'Derse Katılındı' : 'Derse Katıl'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Çıkış Butonu */}
      <div className="has-text-centered mt-5">
        <button
          className="button is-danger is-light"
          onClick={onLogout}
        >
          <span className="icon">
            <i className="fas fa-sign-out-alt"></i>
          </span>
          <span>Çıkış Yap</span>
        </button>
      </div>

      {/* Doğrulama Modal */}
      <div className={`modal ${showPopup ? "is-active" : ""}`}>
        <div className="modal-background" onClick={closePopup}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Doğrulama</p>
            <button
              className="delete"
              aria-label="close"
              onClick={closePopup}
            ></button>
          </header>
          <section className="modal-card-body">
            <div className="content">
              <h3 className="has-text-centered mb-4">
                {selectedCourse ? `${selectedCourse.dersKodu} - ${selectedCourse.dersAdi}` : ''} dersine giriş yapmak için doğrulama yapın.
              </h3>
              
              <div className="buttons is-flex is-flex-direction-column">
                <button
                  className={`button is-fullwidth ${
                    isSmsVerified ? "is-light" : "is-info"
                  }`}
                  onClick={handleSmsVerification}
                  disabled={isSmsVerified}
                  style={isSmsVerified ? {
                    backgroundColor: '#f5f5f5',
                    color: '#7a7a7a'
                  } : {}}
                >
                  {isSmsVerified ? "SMS Doğrulandı" : "SMS Doğrula"}
                </button>

                <button
                  className={`button is-fullwidth ${
                    isFaceVerified ? "is-light" : "is-info"
                  }`}
                  onClick={handleFaceVerification}
                  disabled={isFaceVerified}
                  style={isFaceVerified ? {
                    backgroundColor: '#f5f5f5',
                    color: '#7a7a7a'
                  } : {}}
                >
                  {isFaceVerified ? "Yüz Tanıma Doğrulandı" : "Yüz Tanıma Doğrula"}
                </button>

                {isSmsVerified && isFaceVerified && (
                  <button
                    className="button is-primary is-fullwidth"
                    onClick={handleAuthentication}
                  >
                    Giriş Yap
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Alert Mesajı */}
      {alertMessage && (
        <div className="notification-container">
          <div
            className={`notification is-${alertMessage.severity} is-light`}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              minWidth: "300px",
            }}
          >
            <button className="delete" onClick={clearAlert}></button>
            {alertMessage.text}
          </div>
        </div>
      )}
    </>
  );
};

export default StudentPanel;
