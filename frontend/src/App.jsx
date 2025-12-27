import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'

function App() {
    return (
        <div className="min-h-screen bg-zinc-950 overflow-hidden">
            {/* Split Screen Layout */}
            <div className="flex flex-col lg:flex-row">
                {/* Left Side - Profile Sidebar (40%) */}
                <Sidebar />

                {/* Right Side - Chat Interface (60%) */}
                <ChatInterface />
            </div>
        </div>
    )
}

export default App

