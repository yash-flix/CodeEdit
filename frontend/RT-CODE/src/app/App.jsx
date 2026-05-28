import { BrowserRouter, Route, Routes } from "react-router-dom";
import EditorPage from "../pages/EditorPage";
import JoinPage from "../pages/JoinPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinPage />} />
        <Route path="/room/:roomId" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
