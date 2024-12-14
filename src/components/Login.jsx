import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CssBaseline,
  createTheme,
  ThemeProvider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
  },
  palette: {
    background: {
      default: "#f7f7f7", // Arka plan rengi
    },
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#757575",
    },
  },
});

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      setError("Lütfen kullanıcı adı ve şifre girin.");
      return;
    }

    if (username === "admin" && password === "admin") {
      onLogin({ username, role: "teacher" });
    } else if (username === "user" && password === "user") {
      onLogin({ username, role: "student" });
    } else {
      setError("Geçersiz kullanıcı adı veya şifre!");
      return;
    }

    // "Beni Hatırla" seçeneği aktifse bilgileri localStorage'a kaydet
    if (rememberMe) {
      localStorage.setItem("rememberMe", JSON.stringify({ username }));
    } else {
      localStorage.removeItem("rememberMe");
    }

    setError(""); // Başarılı girişte hata mesajını temizle
  };

  // Sayfa yüklendiğinde kullanıcı bilgilerini hatırla
  React.useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("rememberMe"));
    if (savedUser && savedUser.username) {
      setUsername(savedUser.username);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs" sx={{ mt: 10 }}>
        {/* Logo Ekleme */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="/logo.png" // Logo dosyasının yolu
            alt="Üniversite Logosu"
            style={{
              maxWidth: "100px", // Logonun boyutu
              marginBottom: "10px", // Logo ile diğer içerik arasındaki boşluk
            }}
          />
        </div>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h5"
            component="h1"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            e-Yoklama
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ color: "secondary.main", mb: 3 }}
          >
            Hoşgeldiniz, yoklama sistemine giriş yapınız.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Kullanıcı Adı"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <TextField
              label="Şifre"
              variant="outlined"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Beni Hatırla"
            />
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: "primary.main",
                textTransform: "none", // Büyük harfleri kaldır
                ":hover": { backgroundColor: "primary.dark" },
              }}
              onClick={handleLogin}
            >
              Giriş Yap
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
