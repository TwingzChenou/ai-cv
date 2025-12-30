import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Wake up service (Ping Render)
    useEffect(() => {
        const pingBackend = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
                if (!baseUrl) console.error("VITE_API_URL is missing!");

                await fetch(`${baseUrl}/api/status`);
                console.log('Backend woken up!');
            } catch (err) {
                console.log('Wake up ping failed', err);
            }
        };
        pingBackend();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setInput('');
        setIsLoading(true);

        // Ajout immédiat du message utilisateur
        setMessages(prev => [...prev, userMessage]);

        // Ajout du placeholder pour l'IA (optionnel, mais sympa pour l'UX "loading")
        // On peut juste afficher le loader à la place, ou un message "En train de réfléchir..."
        setMessages(prev => [...prev, { role: 'assistant', content: '...' }]);

        try {
            const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
            if (!baseUrl) {
                console.error("❌ VITE_API_URL n'est pas définie !");
                throw new Error("Configuration erreur: API URL manquante");
            }

            const apiUrl = `${baseUrl}/api/ia/chat`;
            console.log('📡 Appel API vers :', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erreur réseau');
            }

            const data = await response.json();

            // Mise à jour finale
            setMessages(prev => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (lastMsg.role === 'assistant') {
                    lastMsg.content = data.response;
                }
                return newMsgs;
            });

        } catch (error) {
            console.error('Erreur chat:', error);
            setMessages(prev => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (lastMsg.role === 'assistant') {
                    lastMsg.content = "Désolé, une erreur est survenue lors de la communication avec le serveur.";
                }
                return newMsgs;
            });
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const isInitialState = messages.length === 0;

    return (
        <div className="w-full lg:w-[60%] lg:ml-[40%] min-h-screen flex flex-col bg-zinc-950 relative animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-radial from-emerald-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-screen overflow-hidden">
                {/* Messages Area */}
                <div
                    className={`flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 custom-scrollbar transition-opacity duration-700 ease-in-out ${isInitialState ? 'opacity-0 invisible' : 'opacity-100 visible'
                        }`}
                >
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-4 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                                {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                            </div>
                            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-700 text-white' : 'glass-strong text-zinc-100 border border-white/10'}`}>
                                <ReactMarkdown className="prose prose-invert max-w-none text-sm">{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area Container */}
                <div
                    className={`absolute left-0 right-0 px-4 lg:px-8 transition-all duration-700 ease-in-out ${isInitialState
                        ? 'top-1/2 -translate-y-1/2'
                        : 'bottom-0 translate-y-0 bg-zinc-950/50 glass-strong-t border-t border-white/10 py-4 lg:py-8'
                        }`}
                >
                    {/* Welcome Text in Initial State */}
                    <div
                        className={`text-center mb-8 transition-all duration-500 delay-100 ${isInitialState ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4 hidden'
                            }`}
                    >
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                            Bonjour, je suis <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Quentin</span>
                        </h1>
                        <p className="text-zinc-400 text-lg">Posez-moi une question sur mon parcours ou mes projets.</p>
                    </div>

                    <form onSubmit={handleSubmit} className={`flex gap-3 relative max-w-3xl mx-auto w-full transition-all duration-500 ${isInitialState ? 'scale-110' : 'scale-100'}`}>
                        <div className="relative flex-1 group">
                            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${inputRef.current === document.activeElement ? 'opacity-75' : ''}`}></div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Poser moi une question, je me ferais un plaisir d'y répondre"
                                className="relative w-full px-6 py-4 bg-zinc-900 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all shadow-xl"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={`px-6 py-4 bg-emerald-600 rounded-2xl text-white font-bold hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/25 ${isInitialState ? 'aspect-square' : ''}`}
                        >
                            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
