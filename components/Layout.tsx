import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, Settings, Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-red-900 text-gold-history' : 'text-stone-100 hover:bg-red-800';
  };

  return (
    <div className="min-h-screen flex flex-col font-serif bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-stone-100">
      {/* Header / Theme Cover */}
      <header className="bg-red-history text-white shadow-lg border-b-4 border-gold-history relative overflow-hidden">
        {/* Decorative background element simulation */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-gold-history rounded-full shadow-inner">
                <BookOpen className="h-8 w-8 text-red-history" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-widest text-gold-history" style={{ textShadow: '1px 1px 2px black' }}>
                  中国抗战历史展示系统
                </h1>
                <p className="text-red-200 text-sm italic mt-1">铭记历史 · 缅怀先烈 · 珍爱和平</p>
              </div>
            </div>
            
            {/* Member Info (Simulated) */}
            <div className="bg-red-900/50 p-3 rounded border border-red-700 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-sm text-gray-200">
                <Users className="h-4 w-4" />
                <span>当前成员: 管理员</span>
                <span className="text-gray-400">|</span>
                <span>ID: ADMIN_01</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="bg-stone-dark text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-1">
              <Link to="/" className={`px-4 py-3 flex items-center space-x-2 transition-colors duration-200 ${isActive('/')}`}>
                <Home className="h-4 w-4" />
                <span>首页展示</span>
              </Link>
              <Link to="/manage" className={`px-4 py-3 flex items-center space-x-2 transition-colors duration-200 ${isActive('/manage')}`}>
                <Settings className="h-4 w-4" />
                <span>分类管理</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-800 text-stone-400 py-6 border-t-4 border-red-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© 2023 历史展示系统开发小组 | 勿忘国耻 振兴中华</p>
          <p className="text-xs mt-2 text-stone-600">Based on Java + RESTEasy + jQuery + Hibernate Architecture Design</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
