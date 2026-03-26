/**
 * 图片上传和管理组件
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Check, RefreshCw, Search, Link, Database } from 'lucide-react';
import { useImageManager, handleFileUpload, ImageMatcher } from '../imageManager';

const ImageUploader = ({ products = [], onMatchesUpdate }) => {
  const {
    images,
    matches,
    isLoading,
    addImage,
    batchAddImages,
    removeImage,
    setMatch,
    autoMatch,
    getMatch
  } = useImageManager();

  const [dragActive, setDragActive] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // upload, match, manage
  const fileInputRef = useRef(null);

  // 处理拖拽
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // 处理文件拖放
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  // 处理文件选择
  const handleFiles = (files) => {
    const uploaded = handleFileUpload(files);
    setSelectedImages(prev => [...prev, ...uploaded]);
  };

  // 确认上传
  const confirmUpload = () => {
    const imageData = selectedImages.map(img => ({
      filename: img.filename,
      url: img.url,
      category: img.category,
      metadata: {
        size: img.size,
        type: img.type
      }
    }));

    batchAddImages(imageData);
    setSelectedImages([]);
    alert(`成功上传 ${imageData.length} 张图片`);
  };

  // 移除选中的图片
  const removeSelected = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 执行自动匹配
  const handleAutoMatch = () => {
    if (products.length === 0) {
      alert('请先加载产品数据');
      return;
    }

    const productList = products.map(p => ({
      sku: p.品牌货号 || p.sku,
      description: p.描述 || p.description || ''
    }));

    const matches = autoMatch(productList);
    
    if (onMatchesUpdate) {
      onMatchesUpdate(matches);
    }

    alert(`自动匹配完成！成功匹配 ${matches.length} 个产品`);
  };

  // 手动设置匹配
  const handleManualMatch = (sku, imageId) => {
    setMatch(sku, imageId, 100);
  };

  // 过滤图片
  const filteredImages = images.filter(img => 
    img.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 渲染上传区域
  const renderUploadTab = () => (
    <div className="space-y-6">
      {/* 拖拽上传区域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700">点击或拖拽上传图片</p>
        <p className="text-sm text-gray-500 mt-2">支持 JPG, PNG, WebP 格式</p>
      </div>

      {/* 已选图片预览 */}
      {selectedImages.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">已选择 {selectedImages.length} 张图片</h3>
            <div className="space-x-2">
              <button
                onClick={() => setSelectedImages([])}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                清空
              </button>
              <button
                onClick={confirmUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                确认上传
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img.url}
                  alt={img.filename}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  onClick={() => removeSelected(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">{img.filename}</p>
                <span className="text-xs text-blue-600">{img.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 渲染匹配区域
  const renderMatchTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">自动匹配</h3>
        <p className="text-sm text-blue-700 mb-4">
          系统将自动分析产品SKU和描述，从已上传的图片中找到最佳匹配。
          匹配基于：产品类型、容量规格、关键词相似度。
        </p>
        <button
          onClick={handleAutoMatch}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Link className="w-4 h-4 mr-2" />
          )}
          {isLoading ? '匹配中...' : '开始自动匹配'}
        </button>
      </div>

      {/* 匹配结果 */}
      {matches.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-medium">匹配结果 ({matches.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">匹配图片</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">置信度</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {matches.map((match, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{match.sku}</td>
                    <td className="px-4 py-2">
                      {match.image ? (
                        <div className="flex items-center">
                          <img
                            src={match.image.url}
                            alt={match.image.filename}
                            className="w-10 h-10 object-cover rounded mr-2"
                          />
                          <span className="text-sm text-gray-600">{match.image.filename}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">未找到</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-sm ${
                        match.confidence > 80 ? 'text-green-600' : 
                        match.confidence > 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {match.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染管理区域
  const renderManageTab = () => (
    <div className="space-y-6">
      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="搜索图片..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 图片网格 */}
      <div className="grid grid-cols-5 gap-4">
        {filteredImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden group">
            <div className="relative">
              <img
                src={image.url}
                alt={image.filename}
                className="w-full h-32 object-cover"
              />
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-600 truncate">{image.filename}</p>
              <span className="text-xs text-blue-600">{image.category}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-4" />
          <p>暂无图片</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 标签页 */}
      <div className="border-b">
        <div className="flex">
          {[
            { id: 'upload', label: '上传图片', icon: Upload },
            { id: 'match', label: '自动匹配', icon: Link },
            { id: 'manage', label: '图片管理', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'match' && renderMatchTab()}
        {activeTab === 'manage' && renderManageTab()}
      </div>
    </div>
  );
};

export default ImageUploader;
