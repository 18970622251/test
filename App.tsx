import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import CategoryManager from './components/CategoryManager';
import ExhibitView from './components/ExhibitView';

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manage" element={<CategoryManager />} />
          <Route path="/exhibit/:categoryId" element={<ExhibitView />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
