import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Generator } from "./pages/Generator";
import { Online } from "./pages/Online";
import { Editor } from "./pages/Editor";
import { Export } from "./pages/Export";

const basename = process.env.NODE_ENV === 'production' ? '/bead-world' : '';

export default function App() {
  return (
    <Router basename={basename}>
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
