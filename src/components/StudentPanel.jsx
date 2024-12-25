import React, { useState, useEffect } from "react";

const StudentPanel = ({ user, onLogout }) => {
  const [activeCourses, setActiveCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSmsVerified, setIsSmsVerified] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    const courses = JSON.parse(localStorage.getItem("activeAttendance")) || [];
    setActiveCourses(courses);

    const storedAuth = JSON.parse(localStorage.getItem("isAuthenticated"));
    if (storedAuth && storedAuth.username === user.username) {
      setIsAuthenticated(true);
      setSelectedCourse(storedAuth.selectedCourse);
    }
  }, [user.username]);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setIsAuthenticated(false);
    setShowPopup(true);
    setAlertMessage(null);
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

  const handleAuthentication = () => {
    if (isSmsVerified && isFaceVerified) {
      setIsAuthenticated(true);
      const attendanceList = JSON.parse(localStorage.getItem("attendanceList")) || {};
      const courseList = attendanceList[selectedCourse] || [];
      if (!courseList.includes(user.username)) {
        courseList.push(user.username);
        attendanceList[selectedCourse] = courseList;
        localStorage.setItem("attendanceList", JSON.stringify(attendanceList));
      }
      localStorage.setItem(
        "isAuthenticated",
        JSON.stringify({ username: user.username, selectedCourse })
      );
      setShowPopup(false);
      setAlertMessage({
        severity: "info",
        text: `${selectedCourse} dersine başarıyla giriş yaptınız.`,
      });
    } else {
      setAlertMessage({
        severity: "warning",
        text: "Lütfen tüm doğrulamaları tamamlayın.",
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
      <p className="subtitle has-text-centered">
        Merhaba, {user.username}
      </p>

      <h2 className="title is-4 has-text-centered mb-4">Aktif Dersler</h2>

      {activeCourses.length === 0 ? (
        <div className="notification is-info is-light has-text-centered">
          Aktif dersiniz bulunmamaktadır.
        </div>
      ) : (
        <div className="list has-hoverable-list-items">
          {activeCourses.map((course, index) => (
            <div key={index} className="list-item">
              <div className="level is-mobile">
                <div className="level-left">
                  <div className="level-item">{course}</div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <button
                      className="button is-primary"
                      onClick={() => handleCourseSelect(course)}
                    >
                      Derse Katıl
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="has-text-centered mt-5">
        <button
          className="button is-danger is-light"
          onClick={onLogout}
        >
          Çıkış Yap
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
                {selectedCourse} dersine giriş yapmak için doğrulama yapın.
              </h3>
              
              <div className="buttons is-flex is-flex-direction-column">
                <button
                  className={`button is-fullwidth ${
                    isSmsVerified ? "is-success" : "is-info"
                  }`}
                  onClick={handleSmsVerification}
                  disabled={isSmsVerified}
                >
                  {isSmsVerified ? "SMS Doğrulandı ✔️" : "SMS Doğrula"}
                </button>

                <button
                  className={`button is-fullwidth ${
                    isFaceVerified ? "is-success" : "is-info"
                  }`}
                  onClick={handleFaceVerification}
                  disabled={isFaceVerified}
                >
                  {isFaceVerified ? "Yüz Tanıma Doğrulandı ✔️" : "Yüz Tanıma Doğrula"}
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
