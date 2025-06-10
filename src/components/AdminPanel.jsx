import React, { useState, useEffect } from "react";
import "../styles/admin.css";

const AdminPanel = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Dialog states
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [openTeacherDialog, setOpenTeacherDialog] = useState(false);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  
  // Attendance tab states
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedAttendance, setExpandedAttendance] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState([]);
  
  // Form data states
  const [courseData, setCourseData] = useState({
    dersKodu: "",
    dersAdi: "",
    ogretmenler: [],
    ogrenciler: []
  });
  
  const [teacherData, setTeacherData] = useState({
    ad: "",
    soyad: "",
    mail: "",
    sifre: "",
    telno: "",
    role: "teacher"
  });
  
  const [studentData, setStudentData] = useState({
    ad: "",
    soyad: "",
    mail: "",
    sifre: "",
    ogrno: "",
    role: "student"
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Toggle course expansion function
  const toggleCourseExpansion = (courseCode) => {
    if (expandedCourse === courseCode) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseCode);
    }
    setExpandedAttendance(null);
  };
  
  // Function to load attendance details
  const loadAttendanceDetails = async (attendance) => {
    setLoading(true);
    try {
      console.log("Attendance object:", attendance);
      // Extract the ID correctly - it could be a string or an object with $oid
      let attendanceId = attendance._id;
      if (typeof attendanceId === 'object' && attendanceId.$oid) {
        attendanceId = attendanceId.$oid;
      }
      
      console.log("Loading attendance details for ID:", attendanceId);
      const response = await fetch(`http://localhost:5000/api/admin/attendance/${attendanceId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Attendance details error:", response.status, errorData);
        setError(`Yoklama detayları yüklenirken bir hata oluştu: ${response.status} ${errorData.error || ''}`);
        return;
      }
      
      const data = await response.json();
      console.log("Attendance details data:", data);
      
      setCurrentAttendance(data);
      setStudentAttendance(data.ogrenciDetaylari || []);
      setShowAttendanceModal(true);
    } catch (error) {
      console.error("Attendance details loading error:", error);
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to parse MongoDB date objects
  const parseMongoDate = (dateObj) => {
    if (!dateObj) return null;
    
    try {
      // Handle MongoDB extended JSON format with $date property
      if (typeof dateObj === 'object' && dateObj.$date) {
        return new Date(dateObj.$date);
      }
      
      // Handle MongoDB extended JSON format with $oid property for timestamps
      if (typeof dateObj === 'object' && dateObj.$timestamp && dateObj.$timestamp.t) {
        return new Date(dateObj.$timestamp.t * 1000);
      }
      
      // Handle ISODate string format
      if (typeof dateObj === 'string' && dateObj.startsWith('ISODate(')) {
        const isoDateStr = dateObj.substring(8, dateObj.length - 1).replace(/['"]/g, '');
        return new Date(isoDateStr);
      }
      
      // Regular date string or object
      return new Date(dateObj);
    } catch (err) {
      console.error("Error parsing MongoDB date:", err, dateObj);
      return null;
    }
  };
  
  // Function to update student attendance
  const updateStudentAttendance = (studentNo, isPresent) => {
    const updatedStudents = studentAttendance.map(student => {
      if (student.ogrenciNo === studentNo) {
        return { ...student, katildi: isPresent };
      }
      return student;
    });
    setStudentAttendance(updatedStudents);
  };
  
  // Function to save attendance changes
  const saveAttendanceChanges = () => {
    const presentStudents = studentAttendance
      .filter(student => student.katildi)
      .map(student => student.ogrenciNo);
      
    handleUpdateAttendanceRecord(currentAttendance._id, {
      katilanlar: presentStudents
    });
    setShowAttendanceModal(false);
  };

  const fetchAllData = () => {
    fetchCourses();
    fetchTeachers();
    fetchStudents();
    fetchAttendanceData();
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setError("Dersler yüklenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/teachers");
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      } else {
        setError("Öğretmenler yüklenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setError("Öğrenciler yüklenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/attendance");
      if (response.ok) {
        const data = await response.json();
        
        // Group attendance data by course
        const groupedData = data.reduce((acc, item) => {
          if (!acc[item.dersKodu]) {
            acc[item.dersKodu] = {
              dersKodu: item.dersKodu,
              dersAdi: item.dersAdi,
              records: []
            };
          }
          acc[item.dersKodu].records.push(item);
          return acc;
        }, {});
        
        // Convert to array and sort records by date
        const groupedArray = Object.values(groupedData);
        groupedArray.forEach(group => {
          group.records.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
        });
        
        setAttendanceData(groupedArray);
      } else {
        setError("Yoklama verileri yüklenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Course management functions
  const handleCreateCourse = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData)
      });
      
      if (response.ok) {
        setSuccess("Ders başarıyla oluşturuldu.");
        fetchCourses();
        setOpenCourseDialog(false);
        setCourseData({
          dersKodu: "",
          dersAdi: "",
          ogretmenler: [],
          ogrenciler: []
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Ders oluşturulurken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (courseId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData)
      });
      
      if (response.ok) {
        setSuccess("Ders başarıyla güncellendi.");
        fetchCourses();
        setOpenCourseDialog(false);
        setCourseData({
          dersKodu: "",
          dersAdi: "",
          ogretmenler: [],
          ogrenciler: []
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Ders güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bu dersi silmek istediğinize emin misiniz?")) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setSuccess("Ders başarıyla silindi.");
        fetchCourses();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Ders silinirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Teacher management functions
  const handleCreateTeacher = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData)
      });
      
      if (response.ok) {
        setSuccess("Öğretmen başarıyla eklendi.");
        fetchTeachers();
        setOpenTeacherDialog(false);
        setTeacherData({
          ad: "",
          soyad: "",
          mail: "",
          sifre: "",
          telno: "",
          role: "teacher"
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Öğretmen eklenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeacher = async (teacherId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${teacherId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData)
      });
      
      if (response.ok) {
        setSuccess("Öğretmen bilgileri başarıyla güncellendi.");
        fetchTeachers();
        setOpenTeacherDialog(false);
        setTeacherData({
          ad: "",
          soyad: "",
          mail: "",
          sifre: "",
          telno: "",
          role: "teacher"
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Öğretmen güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm("Bu öğretmeni silmek istediğinize emin misiniz?")) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${teacherId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setSuccess("Öğretmen başarıyla silindi.");
        fetchTeachers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Öğretmen silinirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Student management functions
  const handleCreateStudent = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
      });
      
      if (response.ok) {
        setSuccess("Öğrenci başarıyla eklendi.");
        fetchStudents();
        setOpenStudentDialog(false);
        setStudentData({
          ad: "",
          soyad: "",
          mail: "",
          sifre: "",
          ogrno: "",
          role: "student"
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Öğrenci eklenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (studentId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
      });
      
      if (response.ok) {
        setSuccess("Öğrenci bilgileri başarıyla güncellendi.");
        fetchStudents();
        setOpenStudentDialog(false);
        setStudentData({
          ad: "",
          soyad: "",
          mail: "",
          sifre: "",
          ogrno: "",
          role: "student"
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Öğrenci güncellenirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${studentId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setSuccess("Öğrenci başarıyla silindi.");
        fetchStudents();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Öğrenci silinirken bir hata oluştu.");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a function for updating attendance records
  const handleUpdateAttendanceRecord = async (attendanceId, updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/attendance/${attendanceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        setSuccess("Yoklama kaydı güncellendi");
        fetchAttendanceData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Yoklama güncellenirken bir hata oluştu");
      }
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // UI components
  const renderCoursesTab = () => (
    <div className="content-container">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h2 className="title is-4">Dersler</h2>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button 
              className="button is-primary" 
              onClick={() => {
                setCourseData({
                  dersKodu: "",
                  dersAdi: "",
                  ogretmenler: [],
                  ogrenciler: []
                });
                setOpenCourseDialog(true);
              }}
            >
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>Yeni Ders Ekle</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table className="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>Ders Kodu</th>
              <th>Ders Adı</th>
              <th>Öğretmen Sayısı</th>
              <th>Öğrenci Sayısı</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td>{course.dersKodu}</td>
                <td>{course.dersAdi}</td>
                <td>{course.ogretmenler?.length || 0}</td>
                <td>{course.ogrenciler?.length || 0}</td>
                <td>
                  <div className="buttons are-small">
                    <button 
                      className="button is-info" 
                      onClick={() => {
                        setCourseData(course);
                        setOpenCourseDialog(true);
                      }}
                    >
                      <span className="icon">
                        <i className="fas fa-edit"></i>
                      </span>
                    </button>
                    <button 
                      className="button is-danger" 
                      onClick={() => handleDeleteCourse(course._id)}
                    >
                      <span className="icon">
                        <i className="fas fa-trash"></i>
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Course Modal */}
      <div className={`modal ${openCourseDialog ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={() => setOpenCourseDialog(false)}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">{courseData._id ? "Ders Düzenle" : "Yeni Ders Ekle"}</p>
            <button className="delete" aria-label="close" onClick={() => setOpenCourseDialog(false)}></button>
          </header>
          <section className="modal-card-body">
            <div className="field">
              <label className="label">Ders Kodu</label>
              <div className="control">
                <input 
                  className="input" 
                  type="text" 
                  value={courseData.dersKodu}
                  onChange={(e) => setCourseData({...courseData, dersKodu: e.target.value})}
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Ders Adı</label>
              <div className="control">
                <input 
                  className="input" 
                  type="text" 
                  value={courseData.dersAdi}
                  onChange={(e) => setCourseData({...courseData, dersAdi: e.target.value})}
                  readOnly={courseData._id ? true : false}
                />
                {courseData._id && <p className="help is-info">Mevcut ders adı değiştirilemez</p>}
              </div>
            </div>
            
            <div className="field">
              <label className="label">Öğretmenler</label>
              <div className="control">
                <div className="select is-multiple is-fullwidth">
                  <select 
                    multiple 
                    value={courseData.ogretmenler || []} 
                    onChange={(e) => {
                      const selectedOptions = Array.from(
                        e.target.selectedOptions,
                        option => option.value
                      );
                      setCourseData({...courseData, ogretmenler: selectedOptions});
                    }}
                    size="4"
                  >
                    {teachers.map((teacher) => (
                      <option key={teacher.mail} value={teacher.mail}>
                        {teacher.ad} {teacher.soyad} ({teacher.mail})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="help">Ctrl tuşuna basarak birden fazla öğretmen seçebilirsiniz.</p>
              </div>
            </div>
            
            <div className="field">
              <label className="label">Öğrenciler</label>
              <div className="control">
                <div className="select is-multiple is-fullwidth">
                  <select 
                    multiple 
                    value={courseData.ogrenciler || []} 
                    onChange={(e) => {
                      const selectedOptions = Array.from(
                        e.target.selectedOptions,
                        option => option.value
                      );
                      setCourseData({...courseData, ogrenciler: selectedOptions});
                    }}
                    size="4"
                  >
                    {students.map((student) => (
                      <option key={student.ogrno} value={student.ogrno}>
                        {student.ad} {student.soyad} ({student.ogrno})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="help">Ctrl tuşuna basarak birden fazla öğrenci seçebilirsiniz.</p>
              </div>
            </div>
          </section>
          <footer className="modal-card-foot">
            <button 
              className="button is-primary"
              onClick={() => courseData._id ? handleUpdateCourse(courseData._id) : handleCreateCourse()}
            >
              {courseData._id ? "Güncelle" : "Oluştur"}
            </button>
            <button className="button" onClick={() => setOpenCourseDialog(false)}>İptal</button>
          </footer>
        </div>
      </div>
    </div>
  );

  const renderTeachersTab = () => (
    <div className="content-container">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h2 className="title is-4">Öğretmenler</h2>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button 
              className="button is-primary" 
              onClick={() => {
                setTeacherData({
                  ad: "",
                  soyad: "",
                  mail: "",
                  sifre: "",
                  telno: "",
                  role: "teacher"
                });
                setOpenTeacherDialog(true);
              }}
            >
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>Yeni Öğretmen Ekle</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table className="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Soyad</th>
              <th>E-posta</th>
              <th>Telefon</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher._id}>
                <td>{teacher.ad}</td>
                <td>{teacher.soyad}</td>
                <td>{teacher.mail}</td>
                <td>{teacher.telno}</td>
                <td>
                  <div className="buttons are-small">
                    <button 
                      className="button is-info" 
                      onClick={() => {
                        setTeacherData(teacher);
                        setOpenTeacherDialog(true);
                      }}
                    >
                      <span className="icon">
                        <i className="fas fa-edit"></i>
                      </span>
                    </button>
                    <button 
                      className="button is-danger" 
                      onClick={() => handleDeleteTeacher(teacher._id)}
                    >
                      <span className="icon">
                        <i className="fas fa-trash"></i>
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Teacher Modal */}
      <div className={`modal ${openTeacherDialog ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={() => setOpenTeacherDialog(false)}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">{teacherData._id ? "Öğretmen Düzenle" : "Yeni Öğretmen Ekle"}</p>
            <button className="delete" aria-label="close" onClick={() => setOpenTeacherDialog(false)}></button>
          </header>
          <section className="modal-card-body">
            <div className="field">
              <label className="label">Ad</label>
              <div className="control">
                <input 
                  className="input" 
                  type="text" 
                  value={teacherData.ad}
                  onChange={(e) => setTeacherData({...teacherData, ad: e.target.value})}
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Soyad</label>
              <div className="control">
                <input 
                  className="input" 
                  type="text" 
                  value={teacherData.soyad}
                  onChange={(e) => setTeacherData({...teacherData, soyad: e.target.value})}
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">E-posta</label>
              <div className="control">
                <input 
                  className="input" 
                  type="email" 
                  value={teacherData.mail}
                  onChange={(e) => setTeacherData({...teacherData, mail: e.target.value})}
                />
              </div>
            </div>
            
            {!teacherData._id && (
              <div className="field">
                <label className="label">Şifre</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="password" 
                    value={teacherData.sifre}
                    onChange={(e) => setTeacherData({...teacherData, sifre: e.target.value})}
                  />
                </div>
              </div>
            )}
            
            <div className="field">
              <label className="label">Telefon</label>
              <div className="control">
                <input 
                  className="input" 
                  type="text" 
                  value={teacherData.telno}
                  onChange={(e) => setTeacherData({...teacherData, telno: e.target.value})}
                />
              </div>
            </div>
          </section>
          <footer className="modal-card-foot">
            <button 
              className="button is-primary"
              onClick={() => teacherData._id ? handleUpdateTeacher(teacherData._id) : handleCreateTeacher()}
            >
              {teacherData._id ? "Güncelle" : "Ekle"}
            </button>
            <button className="button" onClick={() => setOpenTeacherDialog(false)}>İptal</button>
          </footer>
        </div>
      </div>
    </div>
  );

  const renderStudentsTab = () => (
    <div className="content-container">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h2 className="title is-4">Öğrenciler</h2>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button 
              className="button is-primary" 
              onClick={() => {
                setStudentData({
                  ad: "",
                  soyad: "",
                  mail: "",
                  sifre: "",
                  ogrno: "",
                  role: "student"
                });
                setOpenStudentDialog(true);
              }}
            >
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>Yeni Öğrenci Ekle</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table className="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>Öğrenci No</th>
              <th>Ad</th>
              <th>Soyad</th>
              <th>E-posta</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.ogrno}</td>
                <td>{student.ad}</td>
                <td>{student.soyad}</td>
                <td>{student.mail}</td>
                <td>
                  <div className="buttons are-small">
                    <button 
                      className="button is-info" 
                      onClick={() => {
                        setStudentData(student);
                        setOpenStudentDialog(true);
                      }}
                    >
                      <span className="icon">
                        <i className="fas fa-edit"></i>
                      </span>
                    </button>
                    <button 
                      className="button is-danger" 
                      onClick={() => handleDeleteStudent(student._id)}
                    >
                      <span className="icon">
                        <i className="fas fa-trash"></i>
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Student Modal */}
      <div className={`modal ${openStudentDialog ? 'is-active' : ''}`}>
        <div className="modal-background" onClick={() => setOpenStudentDialog(false)}></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">{studentData._id ? "Öğrenci Düzenle" : "Yeni Öğrenci Ekle"}</p>
            <button className="delete" aria-label="close" onClick={() => setOpenStudentDialog(false)}></button>
          </header>
          <section className="modal-card-body">
            <div className="field">
              <label className="label">Ad</label>
              <div className="control">
                <input 
                  className="input" 
                  type="text" 
                  value={studentData.ad}
                  onChange={(e) => setStudentData({...studentData, ad: e.target.value})}
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Soyad</label>
              <div className="control">
                <input 
                  className="input" 
                  type="text" 
                  value={studentData.soyad}
                  onChange={(e) => setStudentData({...studentData, soyad: e.target.value})}
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">Öğrenci Numarası</label>
              <div className="control">
                <input 
                  className="input" 
                  type="text" 
                  value={studentData.ogrno}
                  onChange={(e) => setStudentData({...studentData, ogrno: e.target.value})}
                />
              </div>
            </div>
            
            <div className="field">
              <label className="label">E-posta</label>
              <div className="control">
                <input 
                  className="input" 
                  type="email" 
                  value={studentData.mail}
                  onChange={(e) => setStudentData({...studentData, mail: e.target.value})}
                />
              </div>
            </div>
            
            {!studentData._id && (
              <div className="field">
                <label className="label">Şifre</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="password" 
                    value={studentData.sifre}
                    onChange={(e) => setStudentData({...studentData, sifre: e.target.value})}
                  />
                </div>
              </div>
            )}
          </section>
          <footer className="modal-card-foot">
            <button 
              className="button is-primary"
              onClick={() => studentData._id ? handleUpdateStudent(studentData._id) : handleCreateStudent()}
            >
              {studentData._id ? "Güncelle" : "Ekle"}
            </button>
            <button className="button" onClick={() => setOpenStudentDialog(false)}>İptal</button>
          </footer>
        </div>
      </div>
    </div>
  );

  const renderAttendanceTab = () => {
    return (
      <div className="content-container">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h2 className="title is-4">Yoklama Verileri</h2>
            </div>
          </div>
        </div>
        
        {attendanceData.length === 0 ? (
          <div className="notification is-info is-light">
            Henüz yoklama verisi bulunmamaktadır.
          </div>
        ) : (
          <div>
            {attendanceData.map((courseGroup) => (
              <div key={courseGroup.dersKodu} className="course-panel mb-4">
                <div 
                  className="course-header"
                  onClick={() => toggleCourseExpansion(courseGroup.dersKodu)}
                >
                  <div className="is-flex is-justify-content-space-between is-align-items-center py-2 px-3">
                    <div className="is-flex is-align-items-center">
                      <span className="icon is-small mr-2">
                        <i className="fas fa-book"></i>
                      </span>
                      <span className="has-text-weight-medium">{courseGroup.dersKodu} - {courseGroup.dersAdi}</span>
                    </div>
                    <div className="is-flex is-align-items-center">
                      <span className="tag is-info is-light mr-2">{courseGroup.records.length} yoklama</span>
                      <span className="icon">
                        <i className={`fas fa-chevron-${expandedCourse === courseGroup.dersKodu ? 'up' : 'down'}`}></i>
                      </span>
                    </div>
                  </div>
                </div>
                
                {expandedCourse === courseGroup.dersKodu && (
                  <div className="course-content">
                    <div className="table-container">
                      <table className="table is-fullwidth is-striped is-hoverable attendance-table">
                        <thead>
                          <tr>
                            <th>Tarih</th>
                            <th>Öğretmen</th>
                            <th>Durum</th>
                            <th>Katılım Oranı</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courseGroup.records.map((attendance) => {
                            const katilimOrani = attendance.katilanlar?.length / attendance.tumOgrenciler?.length * 100 || 0;
                            const teacher = teachers.find(t => t.mail === attendance.ogretmenMail);
                            
                            // Parse MongoDB date using our helper function
                            let formattedDate = "Geçersiz Tarih";
                            try {
                              const parsedDate = parseMongoDate(attendance.tarih);
                              if (parsedDate && !isNaN(parsedDate.getTime())) {
                                formattedDate = parsedDate.toLocaleString('tr-TR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                              }
                            } catch (e) {
                              console.error("Date parsing error:", e, attendance.tarih);
                            }
                            
                            return (
                              <tr key={typeof attendance._id === 'object' ? attendance._id.$oid : attendance._id}>
                                <td>{formattedDate}</td>
                                <td>{teacher ? `${teacher.ad} ${teacher.soyad}` : attendance.ogretmenMail}</td>
                                <td>
                                  <span className={`tag ${attendance.durum === "aktif" ? "is-success" : "is-light"}`}>
                                    {attendance.durum === "aktif" ? "Aktif" : "Tamamlandı"}
                                  </span>
                                </td>
                                <td>
                                  <progress 
                                    className="progress is-small is-info" 
                                    value={katilimOrani} 
                                    max="100"
                                  ></progress>
                                  <span className="is-size-7">{`${Math.round(katilimOrani)}%`}</span>
                                </td>
                                <td>
                                  <button 
                                    className="button is-small is-info" 
                                    onClick={() => loadAttendanceDetails(attendance)}
                                  >
                                    <span className="icon">
                                      <i className="fas fa-edit"></i>
                                    </span>
                                    <span>Düzenle</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Attendance Edit Modal */}
        <div className={`modal ${showAttendanceModal ? 'is-active' : ''}`}>
          <div className="modal-background" onClick={() => setShowAttendanceModal(false)}></div>
          <div className="modal-card attendance-edit-modal">
            <header className="modal-card-head">
              <p className="modal-card-title">Yoklama Düzenle</p>
              <button 
                className="delete" 
                aria-label="close" 
                onClick={() => setShowAttendanceModal(false)}
              ></button>
            </header>
            
            <section className="modal-card-body">
              {currentAttendance && (
                <div>
                  <div className="field">
                    <label className="label">Ders</label>
                    <div className="has-background-light p-2 rounded">
                      <strong>{currentAttendance.dersKodu}</strong> - {currentAttendance.dersAdi}
                    </div>
                  </div>
                  
                  <div className="field">
                    <label className="label">Tarih</label>
                    <div className="has-background-light p-2 rounded">
                      {(() => {
                        if (!currentAttendance) return "";
                        try {
                          const dateValue = currentAttendance.tarih?.$date || currentAttendance.tarih;
                          if (dateValue) {
                            const date = new Date(dateValue);
                            if (!isNaN(date.getTime())) {
                              return date.toLocaleString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                            }
                          }
                          return "Geçersiz Tarih";
                        } catch (error) {
                          console.error("Modal date parsing error:", error);
                          return "Geçersiz Tarih";
                        }
                      })()}
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="field">
                    <label className="label">Öğrenci Listesi</label>
                    
                    {studentAttendance.length > 0 ? (
                      <table className="table is-fullwidth is-striped is-hoverable attendance-table">
                        <thead>
                          <tr>
                            <th>Öğrenci No</th>
                            <th>Ad Soyad</th>
                            <th>Katılım Durumu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentAttendance.map(student => (
                            <tr key={student.ogrenciNo}>
                              <td>{student.ogrenciNo}</td>
                              <td>{student.adSoyad}</td>
                              <td>
                                <div className="field has-addons">
                                  <div className="control" style={{ minWidth: "150px" }}>
                                    <input 
                                      id={`switch-${student.ogrenciNo}`}
                                      type="checkbox" 
                                      className="switch is-rounded is-info"
                                      checked={student.katildi}
                                      onChange={(e) => updateStudentAttendance(student.ogrenciNo, e.target.checked)}
                                    />
                                    <label htmlFor={`switch-${student.ogrenciNo}`} style={{ display: "inline-block", width: "90px" }}>
                                      {student.katildi ? "Katıldı" : "Katılmadı"}
                                    </label>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="notification is-warning">
                        Öğrenci listesi yüklenemedi.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
            
            <footer className="modal-card-foot">
              <button className="button is-success" onClick={saveAttendanceChanges}>
                <span className="icon">
                  <i className="fas fa-save"></i>
                </span>
                <span>Kaydet</span>
              </button>
              <button className="button" onClick={() => setShowAttendanceModal(false)}>İptal</button>
            </footer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      {/* Navbar */}
      <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <a className="navbar-item py-2" href="#">
              <img src="/logo.png" alt="Üniversite Logosu" height="28" />
              <span className="has-text-weight-bold ml-2">e-Yoklama Admin</span>
            </a>
          </div>

          <div id="adminNavbar" className="navbar-menu">
            <div className="navbar-end">
              <div className="navbar-item">
                <span className="has-text-weight-bold">{user.ad} {user.soyad}</span>
              </div>
              <div className="navbar-item">
                <div className="buttons">
                  <button className="button is-light" onClick={onLogout}>
                    <span className="icon">
                      <i className="fas fa-sign-out-alt"></i>
                    </span>
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="container section pb-0 pt-5">
        <div className="tabs is-boxed">
          <ul>
            <li className={activeTab === 0 ? "is-active" : ""}>
              <a onClick={() => setActiveTab(0)}>
                <span className="icon is-small"><i className="fas fa-book"></i></span>
                <span>Dersler</span>
              </a>
            </li>
            <li className={activeTab === 1 ? "is-active" : ""}>
              <a onClick={() => setActiveTab(1)}>
                <span className="icon is-small"><i className="fas fa-chalkboard-teacher"></i></span>
                <span>Öğretmenler</span>
              </a>
            </li>
            <li className={activeTab === 2 ? "is-active" : ""}>
              <a onClick={() => setActiveTab(2)}>
                <span className="icon is-small"><i className="fas fa-user-graduate"></i></span>
                <span>Öğrenciler</span>
              </a>
            </li>
            <li className={activeTab === 3 ? "is-active" : ""}>
              <a onClick={() => setActiveTab(3)}>
                <span className="icon is-small"><i className="fas fa-clipboard-list"></i></span>
                <span>Yoklama Verileri</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container section pt-0 px-5 py-4">
        {loading && <progress className="progress is-small is-primary" max="100"></progress>}
        
        {error && (
          <div className="notification is-danger">
            <button className="delete" onClick={() => setError("")}></button>
            {error}
          </div>
        )}
        
        {success && (
          <div className="notification is-success">
            <button className="delete" onClick={() => setSuccess("")}></button>
            {success}
          </div>
        )}
        
        {activeTab === 0 && renderCoursesTab()}
        {activeTab === 1 && renderTeachersTab()}
        {activeTab === 2 && renderStudentsTab()}
        {activeTab === 3 && renderAttendanceTab()}
      </div>
    </div>
  );
};

export default AdminPanel; 