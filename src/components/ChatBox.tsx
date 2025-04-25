import React, { useState } from 'react'
import { chatWithGemini, chatWithOpenAI } from '../utils/chat-ai';

type Props = {
    data: any[], apiKey: {
        openaiApiKey?: string,
        geminiApiKey?: string,
    }
    aiProvider: "gemini" | "openai";
    onChat?: (data: any[], query: string) => Promise<string>;

}


const ChatBox = ({ data, apiKey, aiProvider, onChat }: Props) => {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!query) return;
        setLoading(true);
        try {
            let result = "";

            if (aiProvider === "openai" && apiKey.openaiApiKey) {
                result = await chatWithOpenAI(apiKey.openaiApiKey, data, query);
            } else if (aiProvider === "gemini" && apiKey.geminiApiKey) {
                result = await chatWithGemini(apiKey.geminiApiKey, data, query);
            } else if (onChat) {
                result = await onChat(data, query);
            }

            setResponse(result);
        } catch (err) {
            console.error("Error in chat submission:", err);
            setResponse("An error occurred while processing your request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="smart-table-chat-box">
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about this table..." />
            <button onClick={handleSubmit}>Ask</button>
            {loading && <div className="smart-table-loading">Loading...</div>}
            {response && <div className="smart-table-response">{response}</div>}
        </div>
    )
}

export default ChatBox