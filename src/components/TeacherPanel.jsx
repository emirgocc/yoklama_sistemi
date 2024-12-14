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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  createTheme,
  ThemeProvider,
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

const TeacherPanel = ({ user, onLogout }) => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceStarted, setAttendanceStarted] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const courses = [
    { id: 1, name: "BIL4104 - Yazılım Mühendisliği" },
    { id: 2, name: "BIL4106 - Yapay Zeka" },
  ];

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
      alert("Lütfen bir ders seçin.");
      return;
    }

    if (attendanceStarted) {
      alert(`${selectedCourse} için yoklama bitirildi.`);
      localStorage.removeItem("selectedCourse");
      localStorage.removeItem("attendanceStarted");
      setAttendanceStarted(false);
      return;
    }

    alert(`${selectedCourse} için yoklama başlatıldı.`);
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
          {/* Header */}
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

          {/* Ders Seçimi */}
          <FormControl variant="standard" fullWidth sx={{ mb: 3 }}>
            <InputLabel id="course-select-label">Ders Seç</InputLabel>
            <Select
              labelId="course-select-label"
              id="course-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              label="Ders Seç"
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.name}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Yoklama Butonları */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color={attendanceStarted ? "error" : "primary"}
              onClick={startOrEndAttendance}
              fullWidth
            >
              {attendanceStarted ? "Yoklama Bitir" : "Yoklama Başlat"}
            </Button>
            {attendanceStarted && (
              <Button
                variant="outlined"
                onClick={handleShowAttendanceList}
                fullWidth
              >
                Listeyi Gör
              </Button>
            )}
          </Box>

          {/* Çıkış Yap Butonu */}
          <Box mt={3} textAlign="center">
            <Button
              variant="contained"
              color="secondary"
              onClick={onLogout}
              fullWidth
            >
              Çıkış Yap
            </Button>
          </Box>
        </Paper>

        {/* Modal for Attendance List */}
        <Modal open={openModal} onClose={handleCloseModal}>
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
              {selectedCourse} - Yoklama Listesi
            </Typography>
            <List>
              {attendanceList.length === 0 ? (
                <Typography align="center">Henüz katılım yok.</Typography>
              ) : (
                attendanceList.map((student, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={student} />
                  </ListItem>
                ))
              )}
            </List>
            <Box mt={2} textAlign="center">
              <Button variant="contained" onClick={handleCloseModal}>
                Kapat
              </Button>
            </Box>
          </Paper>
        </Modal>
      </Container>
    </ThemeProvider>
  );
};

export default TeacherPanel;
