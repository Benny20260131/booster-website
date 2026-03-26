import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="#" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-red-600">BOOSTER</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">欢迎访问 BOOSTER 网站</h1>
            <p className="text-xl text-gray-600">我们提供高质量的实验室产品和解决方案</p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} BOOSTER. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;