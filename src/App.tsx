import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Generator } from "./pages/Generator";
import { Online } from "./pages/Online";
import { Editor } from "./pages/Editor";
import { Export } from "./pages/Export";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/online" element={<Online />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/export" element={<Export />} />
      </Routes>
    </Router>
  );
}
