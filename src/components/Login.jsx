import React, { useState, useEffect } from "react";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("rememberMe"));
    if (savedUser && savedUser.username) {
      setUsername(savedUser.username);
    }
  }, []);

  const handleLogin = () => {
    if (!username || !password) {
      setError("Lütfen e-posta ve şifre girin.");
      return;
    }

    if (username === "admin" && password === "admin") {
      onLogin({ username, role: "teacher" });
    } else if (username === "user" && password === "user") {
      onLogin({ username, role: "student" });
    } else {
      setError("Geçersiz e-posta veya şifre!");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("rememberMe", JSON.stringify({ username }));
    } else {
      localStorage.removeItem("rememberMe");
    }
  };

  return (
    <>
     {error && (
        <div className="message-container">
          <div className="message is-danger">
            <div className="message-body">
              <button 
                className="delete" 
                aria-label="delete"
                onClick={() => setError("")}
              ></button>
              {error}
            </div>
          </div>
        </div>
      )}
      <p className="subtitle has-text-centered is-6 mb-4">
        Hoşgeldiniz, yoklama sistemine giriş yapınız.
      </p>

      {/* Form */}
      <div className="field">
        <div className="control">
          <input
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kurumsal e-postanızı girin"
          />
        </div>
      </div>

      <div className="field">
        <div className="control">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifrenizi girin"
          />
        </div>
      </div>

      <div className="field">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />{" "}
          Beni Hatırla
        </label>
      </div>

      <div className="field">
        <button
          className="button is-primary is-fullwidth"
          onClick={handleLogin}
        >
          Giriş Yap
        </button>
      </div>

    </>
  );
};

export default Login;