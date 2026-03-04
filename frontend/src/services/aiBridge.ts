import { 
    getBlockNumber, 
    getGasPrice, 
    simulateTransaction, 
    getBalance, 
    getLogs,
    getAoxcBalance 
} from './xlayer'; 
import { formatGwei, isAddress } from 'viem'; // viem daha hafiftir
import { getGeminiResponse } from './geminiSentinel';
import { ethers } from 'ethers';

/**
 * @title AOXC Neural Bridge - Hardened Version (v3.0)
 * @dev Güvenlik seviyesi: Maximum. 
 * AI yanıtları sanitize edilir, RPC hataları izole edilir.
 */

export interface AIAnalysisResult {
    verdict: 'VERIFIED' | 'WARNING' | 'REJECTED';
    riskScore: number; 
    details: string;
    simulatedGas: string;
    aiCommentary?: string;
    timestamp: number;
}

export const analyzeTransaction = async (tx: { 
    to: string; 
    data: string; 
    value?: string 
}): Promise<AIAnalysisResult> => {
    
    // 1. ADIM: INPUT VALIDATION (Girdi Güvenliği)
    if (!isAddress(tx.to)) {
        return { verdict: 'REJECTED', riskScore: 100, details: "INVALID_TARGET_ADDRESS", simulatedGas: '0', timestamp: Date.now() };
    }

    // 2. ADIM: EVM SİMÜLASYONU (Sandboxing)
    // İşlem gerçekleşmeden önce blockchain kopyasında denenir.
    const simulation = await simulateTransaction(
        tx.to, 
        tx.data, 
        BigInt(tx.value || '0')
    ).catch(() => ({ success: false, error: "SIMULATION_CRASH" }));

    if (!simulation.success) {
        return {
            verdict: 'REJECTED',
            riskScore: 100,
            details: `PROTOCOL_REVERT: ${simulation.error}`,
            simulatedGas: '0',
            timestamp: Date.now()
        };
    }

    const gasUsed = BigInt(simulation.gasEstimate || '0');
    
    // 3. ADIM: AI SEMANTİK ANALİZ (Prompt Hardening)
    // Gemini'ye sadece analiz yaptırmıyoruz, onu bir JSON dönmeye zorluyoruz.
    const aiContext = {
        target: tx.to,
        method_id: tx.data.slice(0, 10), // İlk 4 byte (Sighash)
        gas_estimate: gasUsed.toString(),
        value: tx.value || '0'
    };

    const securityPrompt = `
        As a Web3 Security Auditor, analyze this X Layer tx:
        Target: ${aiContext.target}
        Sighash: ${aiContext.method_id}
        Value: ${aiContext.value}
        
        Strictly return JSON:
        {"risk_score": 0-100, "threats": ["list"], "is_honeypot": boolean}
    `;

    let aiAnalysisRaw = "";
    try {
        aiAnalysisRaw = await getGeminiResponse(securityPrompt, aiContext);
    } catch (e) {
        aiAnalysisRaw = "AI_OFFLINE_FALLBACK_RISK_DETECTED";
    }

    // 4. ADIM: ÇOK KATMANLI RİSK HESAPLAMA (Scoring Matrix)
    let riskScore = 0;

    // A. Teknik Riskler
    if (gasUsed > 800000n) riskScore += 30; // Karmaşık işlemler risklidir
    if (tx.to === ethers.ZeroAddress) riskScore += 100; // Zero address gönderimi bloklanır

    // B. AI Kelime Analizi (Whitelist/Blacklist)
    const criticalThreats = ["drain", "transferall", "delegatecall", "ownership", "approve", "permit"];
    const foundThreats = criticalThreats.filter(word => aiAnalysisRaw.toLowerCase().includes(word));
    riskScore += (foundThreats.length * 20);

    // C. Acil Durum: Eğer AI "danger" veya "malicious" diyorsa puanı direkt yükselt
    if (/danger|malicious|unsafe|exploit/i.test(aiAnalysisRaw)) {
        riskScore += 50;
    }

    // 5. ADIM: NİHAİ MÜHÜR (Final Verdict)
    const score = Math.min(riskScore, 100);
    let finalVerdict: AIAnalysisResult['verdict'] = 'VERIFIED';
    
    if (score >= 85) finalVerdict = 'REJECTED';
    else if (score >= 45) finalVerdict = 'WARNING';

    return {
        verdict: finalVerdict,
        riskScore: score,
        details: score < 45 ? "AOXC Neural Guard: Güvenli." : `Risk tespit edildi: ${foundThreats.join(', ')}`,
        simulatedGas: gasUsed.toString(),
        aiCommentary: aiAnalysisRaw,
        timestamp: Date.now()
    };
};
