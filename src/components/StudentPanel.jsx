import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Modal,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  createTheme,
  ThemeProvider,
  Alert,
} from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
  },
  palette: {
    background: {
      default: "#f7f7f7",
    },
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#757575",
    },
  },
});

const StudentPanel = ({ user, onLogout }) => {
  const [activeCourses, setActiveCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSmsVerified, setIsSmsVerified] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);

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
  };

  const handleSmsVerification = () => {
    alert("SMS doğrulaması başarıyla tamamlandı.");
    setIsSmsVerified(true);
  };

  const handleFaceVerification = () => {
    alert("Yüz tanıma doğrulaması başarıyla tamamlandı.");
    setIsFaceVerified(true);
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
    } else {
      alert("Lütfen tüm doğrulamaları tamamlayın.");
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setIsSmsVerified(false);
    setIsFaceVerified(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: 10 }}>
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
            Merhaba, {user.username}
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
            Aktif Dersler
          </Typography>
          {activeCourses.length === 0 ? (
            <Alert severity="info" sx={{ textAlign: "center" }}>
              Aktif dersiniz bulunmamaktadır.
            </Alert>
          ) : (
            <List>
              {activeCourses.map((course, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    mb: 1,
                  }}
                >
                  <ListItemText primary={course} />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleCourseSelect(course)}
                  >
                    Derse Katıl
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
          <Box mt={3} textAlign="center">
            <Button variant="contained" color="secondary" onClick={onLogout}>
              Çıkış Yap
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Popup for Verification */}
      <Modal open={showPopup} onClose={closePopup}>
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            p: 3,
          }}
        >
          <Typography variant="h6" align="center" gutterBottom>
            {selectedCourse} dersine giriş yapmak için doğrulama yapın.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleSmsVerification}
              disabled={isSmsVerified}
            >
              {isSmsVerified ? "SMS Doğrulandı ✔️" : "SMS Doğrula"}
            </Button>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleFaceVerification}
              disabled={isFaceVerified}
            >
              {isFaceVerified ? "Yüz Tanıma Doğrulandı ✔️" : "Yüz Tanıma Doğrula"}
            </Button>
          </Box>
          {isSmsVerified && isFaceVerified && (
            <Button variant="contained" color="primary" fullWidth onClick={handleAuthentication}>
              Giriş Yap
            </Button>
          )}
        </Paper>
      </Modal>
    </ThemeProvider>
  );
};

export default StudentPanel;
