import torch
from peft import PeftModel, PeftConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from web3 import Web3
import time

# --- 🧠 ZEKA YÜKLEME ---
MODEL_PATH = "./outputs/aoxcan-core-XLYR-002-SN20260305"
BASE_MODEL = "yazdigin_base_model_adi" # Buraya eğitimde kullandığın base modeli yaz (örn: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0')

print("📦 AOXCORE v2 Yükleniyor... Sabırlı ol, zeka uyanıyor.")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=torch.float16, device_map="auto")
model = PeftModel.from_pretrained(model, MODEL_PATH)

# --- 🔗 BLOCKCHAIN AYARLARI ---
w3 = Web3(Web3.HTTPProvider("https://rpc.xlayer.tech"))
MY_ADDR = "0x1c4bbac6ca0c4f955bccfca5e3ff4f8e8588245e"

def ask_v2_to_decide():
    prompt = "Context: X-Layer Network, Pair: AOXC/OKB, Mode: Organic Pulse. Action:?"
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=10)
        decision = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    return decision

# --- ⏱️ OTONOM DÖNGÜ ---
def run_sentinel():
    print("🛡️ AOXCAN Sentinel-AI AKTİF. Karar yetkisi v2 modelinde.")
    while True:
        decision = ask_v2_to_decide()
        print(f"🧠 Model Kararı: {decision}")
        
        if "EXECUTE" in decision.upper() or "BUY" in decision.upper():
            print("🔥 Model onay verdi! İşlem başlatılıyor...")
            # Buraya v3.2'deki swap fonksiyonunu çağırıyoruz
        
        time.sleep(30) # Karar periyodu

if __name__ == "__main__":
    run_sentinel()
