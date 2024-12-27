import React, { useState, useEffect } from "react";

const TeacherPanel = ({ user, onLogout }) => {
  // Debug için eklenen loglar
  console.log("TeacherPanel'e gelen user:", user);
  console.log("TeacherPanel'e gelen user.mail:", user?.mail);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceStarted, setAttendanceStarted] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Öğretmenin derslerini getir
    const fetchTeacherCourses = async () => {
      try {
        console.log("Dersler için istek atılıyor:", user.mail); // Debug log
        const response = await fetch(`http://localhost:5000/api/courses/teacher/${user.mail}`);
        console.log("Backend yanıtı:", response); // Debug log
        const data = await response.json();
        console.log("Gelen dersler:", data); // Debug log
        
        if (response.ok) {
          setCourses(data.courses);
        } else {
          setAlertMessage({
            severity: "error",
            text: "Dersler yüklenirken bir hata oluştu: " + (data.error || "Bilinmeyen hata")
          });
        }
      } catch (error) {
        console.error('Ders yükleme hatası:', error);
        setAlertMessage({
          severity: "error",
          text: "Dersler yüklenirken bir hata oluştu: " + error.message
        });
      }
    };

    if (user && user.mail) {  // user ve mail kontrolü
      console.log("useEffect tetiklendi, user.mail:", user.mail); // Debug log
      fetchTeacherCourses();
    } else {
      console.log("useEffect tetiklendi fakat user.mail yok!"); // Debug log
    }
  }, [user?.mail]); // dependency'i user?.mail olarak güncelledik

  useEffect(() => {
    const storedCourse = localStorage.getItem("selectedCourse");
    const storedAttendanceStatus = localStorage.getItem("attendanceStarted");

    if (storedCourse && storedAttendanceStatus === "true") {
      setSelectedCourse(storedCourse);
      setAttendanceStarted(true);
      fetchAttendanceList(storedCourse);
    }
  }, []);

  const fetchAttendanceList = (course) => {
    const list = JSON.parse(localStorage.getItem("attendanceList")) || {};
    setAttendanceList(list[course] || []);
  };

  const startOrEndAttendance = () => {
    if (!selectedCourse) {
      setAlertMessage({ severity: "warning", text: "Lütfen bir ders seçin." });
      return;
    }

    if (attendanceStarted) {
      setAlertMessage({
        severity: "info",
        text: `${selectedCourse} için yoklama bitirildi.`,
      });
      localStorage.removeItem("selectedCourse");
      localStorage.removeItem("attendanceStarted");
      setAttendanceStarted(false);
      return;
    }

    setAlertMessage({
      severity: "success",
      text: `${selectedCourse} için yoklama başlatıldı.`,
    });
    localStorage.setItem("selectedCourse", selectedCourse);
    localStorage.setItem("attendanceStarted", "true");
    setAttendanceStarted(true);
  };

  const handleShowAttendanceList = () => {
    fetchAttendanceList(selectedCourse);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const clearAlert = () => {
    setAlertMessage(null);
  };

  return (
    <>
      <p className="subtitle has-text-centered">
        Hoşgeldiniz, {user.ad} {user.soyad}
      </p>

      {/* Ders Seçimi */}
      <div className="field">
        <label className="label">Ders Seç</label>
        <div className="control">
          <div className="select is-fullwidth">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Ders Seçiniz</option>
              {courses.map((course) => (
                <option key={course._id} value={course.kod}>
                  {course.kod} - {course.ad}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Yoklama Kontrolleri */}
      <div className="buttons is-centered mt-5">
        <button
          className={`button is-fullwidth ${
            attendanceStarted ? "is-danger" : "is-primary"
          }`}
          onClick={startOrEndAttendance}
        >
          {attendanceStarted ? "Yoklama Bitir" : "Yoklama Başlat"}
        </button>
        {attendanceStarted && (
          <button
            className="button is-info is-fullwidth"
            onClick={handleShowAttendanceList}
          >
            Listeyi Gör
          </button>
        )}
      </div>

      {/* Çıkış Butonu */}
      <div className="has-text-centered mt-5">
        <button
          className="button is-danger is-light"
          onClick={onLogout}
        >
          Çıkış Yap
        </button>
      </div>

      {/* Yoklama Listesi Modal */}
      <div className={`modal ${openModal ? "is-active" : ""}`}>
        <div className="modal-background" onClick={handleCloseModal}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">
              {selectedCourse} - Yoklama Listesi
            </p>
            <button
              className="delete"
              aria-label="close"
              onClick={handleCloseModal}
            ></button>
          </header>
          <section className="modal-card-body">
            {attendanceList.length === 0 ? (
              <p className="has-text-centered">Henüz katılım yok.</p>
            ) : (
              <div className="content">
                <ul>
                  {attendanceList.map((student, index) => (
                    <li key={index}>{student}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
          <footer className="modal-card-foot">
            <button className="button" onClick={handleCloseModal}>
              Kapat
            </button>
          </footer>
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

export default TeacherPanel;
