import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit, Upload, Sparkles, X, Save, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Category, Exhibit } from '../types';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';

const ExhibitView: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExhibit, setCurrentExhibit] = useState<Partial<Exhibit>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (categoryId) {
        const cats = await StorageService.getCategories();
        const foundCat = cats.find(c => c.id === categoryId);
        setCategory(foundCat || null);

        const exData = await StorageService.getExhibitsByCategory(categoryId);
        setExhibits(exData);
        // Reset selection when entering category
        setSelectedIndex(0);
      }
      setLoading(false);
    };
    init();
  }, [categoryId]);

  // Ensure index stays valid if items are deleted
  useEffect(() => {
    if (exhibits.length > 0 && selectedIndex >= exhibits.length) {
      setSelectedIndex(exhibits.length - 1);
    }
  }, [exhibits.length, selectedIndex]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExhibit.name || !currentExhibit.code) {
      alert("请填写展品名称和编号");
      return;
    }

    const allExhibits = await StorageService.getExhibits();
    let updatedExhibits: Exhibit[];
    let newIndex = selectedIndex;

    if (isEditing && currentExhibit.id) {
      updatedExhibits = allExhibits.map(ex => 
        ex.id === currentExhibit.id ? { ...ex, ...currentExhibit } as Exhibit : ex
      );
    } else {
      const newExhibit: Exhibit = {
        id: Date.now().toString(),
        code: currentExhibit.code!,
        name: currentExhibit.name!,
        categoryId: categoryId!,
        description: currentExhibit.description || '',
        image: currentExhibit.image || 'https://picsum.photos/600/400'
      };
      updatedExhibits = [...allExhibits, newExhibit];
      // Switch to the newly created item (which will be at the end of the filtered list)
      const newLocalLength = updatedExhibits.filter(ex => ex.categoryId === categoryId).length;
      newIndex = newLocalLength - 1;
    }

    await StorageService.saveExhibits(updatedExhibits);
    
    // Refresh local state
    const newLocalExhibits = updatedExhibits.filter(ex => ex.categoryId === categoryId);
    setExhibits(newLocalExhibits);
    setSelectedIndex(newIndex);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("确认移除该展品吗？")) {
      const allExhibits = await StorageService.getExhibits();
      const updated = allExhibits.filter(e => e.id !== id);
      await StorageService.saveExhibits(updated);
      setExhibits(exhibits.filter(e => e.id !== id));
      // Index adjustment handled by useEffect
    }
  };

  const handleOpenAdd = () => {
    setCurrentExhibit({
      code: '',
      name: '',
      description: '',
      image: 'https://picsum.photos/600/400', // Default placeholder
      categoryId: categoryId 
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ex: Exhibit) => {
    setCurrentExhibit({...ex});
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await StorageService.fileToBase64(e.target.files[0]);
        setCurrentExhibit(prev => ({ ...prev, image: base64 }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenerateDescription = async () => {
    if (!currentExhibit.name || !category) {
      alert("请先填写展品名称");
      return;
    }
    setGenerating(true);
    const desc = await GeminiService.generateDescription(currentExhibit.name, category.title);
    setCurrentExhibit(prev => ({ ...prev, description: desc }));
    setGenerating(false);
  };

  const handleNext = () => {
    if (selectedIndex < exhibits.length - 1) {
      setSelectedIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(prev => prev - 1);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-600">载入展览中...</div>;
  if (!category) return <div className="p-10 text-center text-red-800">未找到该分类</div>;

  const selectedExhibit = exhibits[selectedIndex];

  return (
    <div className="h-full flex flex-col">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center text-stone-600 hover:text-red-history transition bg-white px-3 py-2 rounded shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回大厅
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-red-history flex items-center">
              <span className="mr-3">{category.title}</span>
              <span className="text-sm font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                {category.code}
              </span>
            </h1>
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center px-4 py-2 bg-red-history text-white rounded shadow hover:bg-red-800 transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          新增展品
        </button>
      </div>

      {/* Main Content: Split View */}
      <div className="flex flex-col md:flex-row gap-6 flex-grow min-h-[600px]">
        
        {/* Sidebar: Exhibit List */}
        <div className="w-full md:w-1/4 flex flex-col bg-white rounded-lg shadow-md border border-stone-200 overflow-hidden">
          <div className="p-4 bg-stone-100 border-b border-stone-200 flex justify-between items-center">
            <h3 className="font-bold text-stone-700">展品目录</h3>
            <span className="text-xs bg-stone-300 text-stone-700 px-2 py-1 rounded-full">{exhibits.length} 件</span>
          </div>
          <div className="flex-grow overflow-y-auto p-2 space-y-1 bg-stone-50">
            {exhibits.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => setSelectedIndex(idx)}
                className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 flex flex-col group ${
                  idx === selectedIndex
                  ? 'bg-red-history text-white shadow-md'
                  : 'text-stone-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-stone-200'
                }`}
              >
                <span className="font-bold text-sm truncate">{ex.name}</span>
                <span className={`text-xs mt-1 ${idx === selectedIndex ? 'text-red-200' : 'text-stone-400 group-hover:text-stone-500'}`}>
                  {ex.code}
                </span>
              </button>
            ))}
            {exhibits.length === 0 && (
              <div className="p-8 text-center text-stone-400 text-sm">
                暂无展品，请点击右上角添加。
              </div>
            )}
          </div>
        </div>

        {/* Main Display Area: Large Card */}
        <div className="w-full md:w-3/4 flex flex-col">
          {selectedExhibit ? (
            <div className="bg-white rounded-lg shadow-xl border border-stone-200 flex flex-col h-full overflow-hidden animate-fade-in relative">
              
              {/* Exhibit Image Area - Top Half */}
              <div className="relative h-1/2 min-h-[300px] bg-stone-900 flex items-center justify-center overflow-hidden">
                <img 
                  src={selectedExhibit.image} 
                  alt={selectedExhibit.name} 
                  className="w-full h-full object-contain" 
                />
                
                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button 
                    onClick={() => handleOpenEdit(selectedExhibit)} 
                    className="p-2 bg-white/90 backdrop-blur rounded-full text-indigo-700 shadow-lg hover:bg-indigo-50 transition transform hover:scale-105"
                    title="编辑展品"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedExhibit.id)} 
                    className="p-2 bg-white/90 backdrop-blur rounded-full text-red-700 shadow-lg hover:bg-red-50 transition transform hover:scale-105"
                    title="移除展品"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Exhibit Info Area - Bottom Half */}
              <div className="flex-grow flex flex-col p-6 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-paper">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-red-history text-gold-history text-xs px-2 py-1 rounded font-bold tracking-wider shadow-sm">
                        {selectedExhibit.code}
                      </span>
                      <span className="text-stone-500 text-xs uppercase tracking-widest">
                        History Exhibition
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-stone-800 font-serif">
                      {selectedExhibit.name}
                    </h2>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-stone-700 leading-8 text-lg text-justify font-serif border-l-4 border-red-900/20 pl-4">
                    {selectedExhibit.description || <span className="italic text-stone-400">暂无详细介绍，请编辑添加...</span>}
                  </p>
                </div>

                {/* Navigation Footer */}
                <div className="mt-6 pt-4 border-t border-stone-300 flex justify-between items-center">
                  <button 
                    onClick={handlePrev} 
                    disabled={selectedIndex === 0}
                    className={`flex items-center px-4 py-2 rounded font-medium transition ${
                      selectedIndex === 0 
                        ? 'text-stone-300 cursor-not-allowed' 
                        : 'text-stone-700 hover:bg-stone-200 hover:text-red-900'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    上一件展品
                  </button>

                  <div className="text-xs text-stone-400">
                    {selectedIndex + 1} / {exhibits.length}
                  </div>

                  <button 
                    onClick={handleNext} 
                    disabled={selectedIndex === exhibits.length - 1}
                    className={`flex items-center px-4 py-2 rounded font-medium transition ${
                      selectedIndex === exhibits.length - 1
                        ? 'text-stone-300 cursor-not-allowed' 
                        : 'text-stone-700 hover:bg-stone-200 hover:text-red-900'
                    }`}
                  >
                    下一件展品
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            // Empty Selection State
            <div className="h-full flex flex-col items-center justify-center bg-white border-2 border-dashed border-stone-300 rounded-lg text-stone-500 p-8 shadow-inner">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="h-10 w-10 text-stone-300" />
              </div>
              <p className="text-xl font-medium mb-2">此处暂无展示内容</p>
              <p className="text-sm text-stone-400 mb-6">从左侧列表选择展品，或添加新内容</p>
              <button 
                onClick={handleOpenAdd}
                className="px-6 py-2 bg-red-history text-white rounded hover:bg-red-800 transition"
              >
                添加第一件展品
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Modal (Identical to previous, keeping for functionality) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-stone-50 rounded shadow-2xl w-full max-w-2xl p-0 overflow-hidden animate-fade-in-up border border-stone-300">
             <div className="bg-red-history px-6 py-4 flex justify-between items-center">
               <h3 className="text-xl font-bold text-gold-history">{isEditing ? '编辑展板信息' : '创建新展板'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-red-200 hover:text-white"><X /></button>
             </div>
             
             <div className="p-6 max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Left Col: Image & Basic Info */}
                   <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700">展品图片</label>
                        <div className="mt-2 relative">
                          <img src={currentExhibit.image} className="w-full h-48 object-cover rounded border border-gray-300 bg-gray-100" />
                          <label className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded cursor-pointer hover:bg-opacity-70 transition">
                            <Upload size={16} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700">展品ID (自动)</label>
                          <input disabled value={currentExhibit.id || 'New'} className="w-full p-2 bg-gray-200 text-sm rounded border border-gray-300" />
                        </div>
                        <div>
                           <label className="block text-xs font-semibold text-stone-700">所属分类</label>
                           <input disabled value={category.title} className="w-full p-2 bg-gray-200 text-sm rounded border border-gray-300" />
                        </div>
                      </div>
                   </div>

                   {/* Right Col: Details */}
                   <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700">展品编号</label>
                        <input 
                          type="text" 
                          required
                          value={currentExhibit.code}
                          onChange={e => setCurrentExhibit({...currentExhibit, code: e.target.value})}
                          className="w-full px-3 py-2 border border-stone-300 rounded focus:border-red-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700">展品名称</label>
                        <input 
                          type="text" 
                          required
                          value={currentExhibit.name}
                          onChange={e => setCurrentExhibit({...currentExhibit, name: e.target.value})}
                          className="w-full px-3 py-2 border border-stone-300 rounded focus:border-red-500 outline-none" 
                        />
                      </div>
                      <div className="flex-grow flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-semibold text-stone-700">展品介绍</label>
                          <button 
                            type="button" 
                            onClick={handleGenerateDescription}
                            disabled={generating}
                            className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                          >
                             <Sparkles size={12} className="mr-1" />
                             {generating ? 'AI撰写中...' : 'AI 辅助撰写'}
                          </button>
                        </div>
                        <textarea 
                          rows={6}
                          value={currentExhibit.description}
                          onChange={e => setCurrentExhibit({...currentExhibit, description: e.target.value})}
                          className="w-full px-3 py-2 border border-stone-300 rounded focus:border-red-500 outline-none text-sm leading-relaxed" 
                          placeholder="输入详细的展品历史背景..."
                        />
                      </div>
                   </div>
                   
                   <div className="col-span-1 md:col-span-2 flex justify-end pt-4 border-t border-gray-200">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded mr-2">取消</button>
                     <button type="submit" className="px-6 py-2 bg-red-history text-gold-history font-bold rounded shadow hover:bg-red-900 transition flex items-center">
                       <Save size={16} className="mr-2" /> 保存展板
                     </button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExhibitView;