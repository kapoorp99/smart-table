import React, { useState } from 'react'
import { chatWithOpenAI } from '../utils/chat-ai';

type Props = { data: any[], apiKey: string }


const ChatBox = ({ data, apiKey }: Props) => {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");

    const handleSubmit = async () => {
        const result = await chatWithOpenAI(apiKey, data, query);
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