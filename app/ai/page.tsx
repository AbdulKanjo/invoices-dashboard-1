import { MobileNav } from "@/components/mobile-nav"

export default function AIPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MobileNav />
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-white mb-6">AI Assistant</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI Feature Cards */}
          <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
                <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path>
                <path d="M4 12H2"></path>
                <path d="M10 12H8"></path>
                <path d="M16 12h-2"></path>
                <path d="M22 12h-2"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-xl text-white">Predictive Inventory</h3>
            <p className="text-slate-400">AI-powered inventory forecasting to optimize chemical and equipment stock levels.</p>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg mt-2 transition-colors">
              Coming Soon
            </button>
          </div>
          
          <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-lg w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3 className="font-semibold text-xl text-white">Smart Usage Analysis</h3>
            <p className="text-slate-400">Analyze chemical usage patterns to identify optimization opportunities across locations.</p>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg mt-2 transition-colors">
              Coming Soon
            </button>
          </div>
          
          <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
            <div className="bg-purple-500/10 text-purple-400 p-3 rounded-lg w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                <path d="M2 2l7.586 7.586"></path>
                <circle cx="11" cy="11" r="2"></circle>
              </svg>
            </div>
            <h3 className="font-semibold text-xl text-white">Cost Optimization</h3>
            <p className="text-slate-400">AI recommendations for cost savings based on historical purchase patterns.</p>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg mt-2 transition-colors">
              Coming Soon
            </button>
          </div>
        </div>
        
        {/* Additional section - Chat Bot */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">AI Assistant Chat</h2>
          <p className="text-slate-400 mb-6">Ask questions about your inventory, usage patterns, or get recommendations for optimizing your car wash operations.</p>
          
          <div className="bg-slate-800 rounded-xl p-4 mb-4 h-64 overflow-y-auto flex flex-col space-y-4">
            <div className="bg-slate-700 rounded-lg p-3 max-w-[80%] self-start">
              <p className="text-slate-300">Hello! How can I help you with your car wash operations today?</p>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-3 max-w-[80%] self-end">
              <p className="text-emerald-300">This feature is coming soon! Our team is working on integrating intelligent assistants to help you analyze your data.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type your question here..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled
            />
            <button 
              className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
              disabled
            >
              Send
            </button>
          </div>
          <p className="text-slate-500 text-sm mt-2">AI features are under development and will be available in future updates.</p>
        </div>
      </div>
    </div>
  )
}
