// src/services/geminiSentinel.ts

export class GeminiSentinel {
    private backendUrl = "http://localhost:5000/api/analyze";

    async analyzeSystemState(contextLogs: string, operation: string) {
        try {
            const response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Analyze this X Layer tx: ${operation}`,
                    context: contextLogs
                })
            });

            if (!response.ok) throw new Error("Backend_Unreachable");

            return await response.json();
        } catch (e) {
            return { 
                risk: 100, 
                reason: "Neural Link Blocked: Secure Proxy Offline.", 
                action: "REJECT" 
            };
        }
    }
}
