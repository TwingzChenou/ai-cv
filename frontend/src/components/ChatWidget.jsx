import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Bonjour ! Je suis Quentin. Posez-moi des questions sur mon parcours, mes compétences ou mes projets !' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/ia/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });

            if (!response.ok) throw new Error('Erreur réseau');

            const data = await response.json();

            const aiMessage = {
                role: 'assistant',
                content: data.response || "Désolé, je n'ai pas pu récupérer la réponse."
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Erreur chat:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Désolé, une erreur est survenue lors de la communication avec le serveur."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
            {/* Fenêtre de chat */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-zinc-900 rounded-lg shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out transform origin-bottom-right">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Assistant CV</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <div className="flex-1" />
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}
                `}>
                                    {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                                </div>

                                <div className={`
                  max-w-[80%] rounded-lg p-3 text-sm
                  ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-sm'}
                `}>
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-sm dark:prose-invert text-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p>{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                                    <Bot size={16} className="text-white" />
                                </div>
                                <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 shadow-sm flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">L'IA réfléchit...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Posez une question..."
                                className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border-0 rounded-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Button Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isOpen ? 'bg-zinc-700 text-white rotate-90' : 'bg-blue-600 text-white'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
};

export default ChatWidget;
