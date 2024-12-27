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

  const handleLogin = async () => {
    try {
      const loginData = {
        mail: username,
        sifre: password
      };
      console.log('Gönderilen veriler:', loginData);

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      console.log('Status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Bağlantı hatası: ' + error.message);
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