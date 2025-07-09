import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import ItemRegisterPage from "./pages/ItemRegisterPage";
import ItemsPage from "./pages/ItemsPage";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/register-item" element={<ItemRegisterPage />} />
        <Route path="/lost-found-items" element={<ItemsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
