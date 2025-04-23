// utils/chatWithOpenAI.ts
export async function chatWithOpenAI(apiKey: string, tableData: any[], userQuery: string) {
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
                    content: "You're a data analyst helping a user understand their table data.",
                },
                {
                    role: "user",
                    content: `Here is the data: ${JSON.stringify(tableData.slice(0, 50))}\n\nUser question: ${userQuery}`,
                },
            ],
        }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content;
}


// utils/chatWithGemini.ts
export async function chatWithGemini(apiKey: string, tableData: any[], userQuery: string) {
    const prompt = `You are a data assistant. Given this table: ${JSON.stringify(tableData.slice(0, 50))}, answer this: ${userQuery}`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
        }),
    });

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}
