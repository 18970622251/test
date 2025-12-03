import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Edit, Trash2, Upload, Save, X } from 'lucide-react';
import { Category } from '../types';
import { StorageService } from '../services/storageService';

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Default icon used if none provided
  const DEFAULT_ICON = 'https://picsum.photos/id/1047/200/200';

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除此分类吗？这将同时移除该分类下的所有展示内容。')) {
      const updated = categories.filter(c => c.id !== id);
      await StorageService.saveCategories(updated);
      // In a real app, we would also cascade delete exhibits, 
      // but for this simulated scope we update the category list only.
      setCategories(updated);
    }
  };

  const handleOpenAdd = () => {
    setCurrentCategory({
      code: '',
      title: '',
      icon: DEFAULT_ICON
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setCurrentCategory({ ...cat });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCategory.code || !currentCategory.title) {
      alert("请填写编号和标题");
      return;
    }

    let updatedList = [...categories];

    if (isEditing && currentCategory.id) {
      updatedList = updatedList.map(c => 
        c.id === currentCategory.id ? (currentCategory as Category) : c
      );
    } else {
      const newCat: Category = {
        id: Date.now().toString(),
        code: currentCategory.code!,
        title: currentCategory.title!,
        icon: currentCategory.icon || DEFAULT_ICON
      };
      updatedList.push(newCat);
    }

    await StorageService.saveCategories(updatedList);
    setCategories(updatedList);
    setIsModalOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await StorageService.fileToBase64(e.target.files[0]);
        setCurrentCategory(prev => ({ ...prev, icon: base64 }));
      } catch (err) {
        console.error("Upload failed", err);
        alert("图片处理失败");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-stone-800 border-l-4 border-red-history pl-3">分类管理</h2>
        <div className="flex space-x-2">
          <button 
            onClick={fetchCategories} 
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新列表
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center px-4 py-2 bg-red-history text-white rounded hover:bg-red-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加分类
          </button>
        </div>
      </div>

      {/* List / Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类图标</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类标题</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={cat.icon} alt={cat.title} className="h-10 w-10 rounded object-cover border border-gray-300 shadow-sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cat.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenEdit(cat)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit className="h-4 w-4 inline" /> 修改
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4 inline" /> 删除
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  暂无分类数据，请添加。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-up">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {isEditing ? '修改分类' : '添加分类'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类编号</label>
                <input 
                  type="text" 
                  value={currentCategory.code}
                  onChange={e => setCurrentCategory({...currentCategory, code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="例如：C001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类标题</label>
                <input 
                  type="text" 
                  value={currentCategory.title}
                  onChange={e => setCurrentCategory({...currentCategory, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="例如：主要战役"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类图标 (默认已提供)</label>
                <div className="flex items-center space-x-4">
                  <div className="relative group">
                    <img 
                      src={currentCategory.icon || DEFAULT_ICON} 
                      alt="Preview" 
                      className="h-16 w-16 rounded object-cover border border-gray-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition rounded" />
                  </div>
                  <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <span className="flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      上传新图标
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex items-center px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-red-history hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
