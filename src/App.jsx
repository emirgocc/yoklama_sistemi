import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import TeacherPanel from "./components/TeacherPanel";
import StudentPanel from "./components/StudentPanel";

function App() {
  const [user, setUser] = useState(null);

  // Sayfa yüklendiğinde, localStorage'dan kullanıcı bilgisini al
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Kullanıcıyı localStorage'a kaydet
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Oturum bilgisini temizle
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      {user.role === "teacher" ? (
        <TeacherPanel user={user} onLogout={handleLogout} />
      ) : (
        <StudentPanel user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
