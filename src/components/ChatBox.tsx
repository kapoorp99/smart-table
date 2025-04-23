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

    const handleSubmit = async () => {
        let result = "";

        if (aiProvider === "openai" && apiKey.openaiApiKey) {
            result = await chatWithOpenAI(apiKey.openaiApiKey, data, query);
        } else if (aiProvider === "gemini" && apiKey.geminiApiKey) {
            result = await chatWithGemini(apiKey.geminiApiKey, data, query);
        } else if (onChat) {
            result = await onChat(data, query);
        }

        setResponse(result);
    };

    return (
        <div className="chat-box">
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about this table..." />
            <button onClick={handleSubmit}>Ask</button>
            <div className="response">{response}</div>
        </div>
    )
}

export default ChatBox