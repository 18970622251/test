import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';
import { StorageService } from '../services/storageService';
import { ArrowRight, Star } from 'lucide-react';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    StorageService.getCategories().then(setCategories);
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-10">
        <h2 className="text-4xl font-serif font-bold text-stone-800 mb-4">铭记峥嵘岁月</h2>
        <div className="w-24 h-1 bg-red-history mx-auto mb-6"></div>
        <p className="max-w-2xl mx-auto text-lg text-stone-600">
          欢迎进入中国抗战历史展示系统。请点击下方分类入口，浏览珍贵的历史展品与详细资料。
        </p>
      </section>

      {/* Category Grid (Detailed Classification Entry) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/exhibit/${category.id}`}
              className="group block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-red-history transform hover:-translate-y-1"
            >
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition z-10" />
                <img 
                  src={category.icon} 
                  alt={category.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-6 z-20">
                   <div className="flex items-center space-x-2 text-gold-history mb-1">
                      <Star size={16} fill="currentColor" />
                      <span className="text-xs tracking-wider uppercase">Topic Code: {category.code}</span>
                   </div>
                   <h3 className="text-2xl font-bold text-white group-hover:text-gold-history transition">
                     {category.title}
                   </h3>
                </div>
              </div>
              <div className="p-4 bg-stone-50 flex justify-between items-center group-hover:bg-red-50 transition">
                <span className="text-stone-600 text-sm font-medium">点击进入展厅</span>
                <ArrowRight className="h-5 w-5 text-red-history transform group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow-inner">
             <p className="text-gray-500 mb-4">系统暂无分类数据。</p>
             <Link to="/manage" className="text-red-history font-bold hover:underline">前往管理后台添加</Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
