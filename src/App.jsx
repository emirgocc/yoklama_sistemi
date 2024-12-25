import React, { useState, useEffect } from "react";
import Login from "./components/login";
import TeacherPanel from "./components/TeacherPanel";
import StudentPanel from "./components/StudentPanel";
import "./styles/global.css";
import "bulma/css/bulma.min.css";

function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const renderContent = () => {
    if (!user) {
      return <Login onLogin={handleLogin} />;
    }
    return user.role === "teacher" ? (
      <TeacherPanel user={user} onLogout={handleLogout} />
    ) : (
      <StudentPanel user={user} onLogout={handleLogout} />
    );
  };
  
  return (
    <div className="container">
      <div className="section">
      

        <div className="columns is-centered">
          <div className={`column ${!user ? 'is-5-tablet is-4-desktop is-3-widescreen' : 'is-4'}`}>
            <figure className="image is-96x96 mx-auto mb-5">
              <img src="/logo.png" alt="Üniversite Logosu" />
            </figure>
            <h1 className="title has-text-centered">e-Yoklama</h1>
            <div className="box">
              
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
