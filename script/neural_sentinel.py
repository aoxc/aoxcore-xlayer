import google.generativeai as genai
from web3 import Web3
import os

# 1. Google AI Kurulumu
genai.configure(api_key="SENIN_GEMINI_API_KEYIN") # Gemini API Key'ini buraya yaz
ai_model = genai.GenerativeModel('gemini-1.5-flash')

# 2. Local Anvil Bağlantısı
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

def analyze_v1_migration(holder_address, amount):
    # Gemini'ye risk analizi yaptırıyoruz
    prompt = f"""
    Analyze this AOXC V1 to V2 migration request:
    Holder: {holder_address}
    Amount: {amount} AOXC
    Platform: XLayer Network
    Context: The user wants to upgrade to a neural-gated V2 Core.
    Task: Is this transaction patterns typical of a bot or a malicious drainer? 
    Return a Risk Score (0-100) and a short reason.
    """
    response = ai_model.generate_content(prompt)
    return response.text

# Test için V1 adresini analiz edelim
print(analyze_v1_migration("0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82", 1000000))
