import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "👋 Bonjour ! Je suis Quentin. Posez-moi des questions sur mon parcours, mes compétences techniques, ou mes projets !"
        }
    ]);
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

    return (
        <div className="w-full lg:w-[60%] lg:ml-[40%] min-h-screen flex flex-col bg-zinc-950 relative animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-radial from-emerald-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-screen overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 custom-scrollbar">
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

                {/* Input Area */}
                <div className="glass-strong-t border-t border-white/10 p-4 lg:p-8 bg-zinc-950/50">
                    <form onSubmit={handleSubmit} className="flex gap-3 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Posez une question..."
                            className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-emerald-500/50"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={!input.trim() || isLoading} className="px-6 py-4 bg-emerald-600 rounded-2xl text-white font-bold hover:bg-emerald-500 transition-all">
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
