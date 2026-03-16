import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Pages
import Home        from './pages/Home';
import About       from './pages/About';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* ── Public pages ─────────────────────────── */}
          <Route path="/"       element={<Home />} />
          <Route path="/about"  element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
