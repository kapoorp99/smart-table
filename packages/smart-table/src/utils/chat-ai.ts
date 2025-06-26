// utils/chatWithOpenAI.ts
export async function chatWithOpenAI(apiKey: string, tableData: any[], userQuery: string) {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('OpenAI API key is required');
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You're a data analyst helping a user understand their table data. Provide clear, helpful insights in markdown format.",
                    },
                    {
                        role: "user",
                        content: `Here is the data: ${JSON.stringify(tableData.slice(0, 50))}\n\nUser question: ${userQuery}`,
                    },
                ],
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const result = data.choices?.[0]?.message?.content;
        
        if (!result) {
            throw new Error('No response received from OpenAI');
        }
        
        return result;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
    }
}


// utils/chatWithGemini.ts
export async function chatWithGemini(apiKey: string, tableData: any[], userQuery: string) {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('Gemini API key is required');
    }

    try {
        const prompt = `You are a data assistant. Given this table: ${JSON.stringify(tableData.slice(0, 50))}, answer this: ${userQuery}. Provide your response in markdown format with clear insights.`;

        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.7,
                },
            }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`Gemini API error: ${res.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await res.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!result) {
            throw new Error('No response received from Gemini');
        }
        
        return result;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}
