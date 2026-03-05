import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# --- 🛰️ AOXCORE OFFLINE CONFIG ---
# 1. Ana Zeka (Baba) - SmolLM dosyalarının olduğu yer
# find komutuyla bulduğun yerel SmolLM klasör yolunu buraya yaz
BASE_MODEL_LOCAL_PATH = "/home/orcun/Work/smollm/text/evaluation/smollm2" 

# 2. Senin Eğitimin (Evlat/Adapter)
ADAPTER_PATH = "/home/orcun/Work/AOXCORE/aoxcai/aoxcan-working/outputs/aoxcan-core-XLYR-002-SN20260305/checkpoint-25"

print("📡 AOXCAN v2: Tam Yerel Mod Başlatılıyor...")

try:
    # local_files_only=True diyerek interneti tamamen yasaklıyoruz
    tokenizer = AutoTokenizer.from_pretrained(ADAPTER_PATH, local_files_only=True)
    
    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_LOCAL_PATH,
        torch_dtype=torch.float32,
        device_map={"": "cpu"},
        local_files_only=True, # DIŞARIYLA BAĞLANTIYI KESER
        trust_remote_code=True
    )
    
    model = PeftModel.from_pretrained(base_model, ADAPTER_PATH)
    model.eval()
    
    print("\n✅ SİSTEM MÜHÜRLENDİ: %100 YEREL")
    print("-" * 50)

    while True:
        msg = input("\n👤 Sen: ")
        if msg.lower() in ["exit", "quit"]: break
        
        inputs = tokenizer(msg, return_tensors="pt")
        with torch.no_grad():
            output = model.generate(
                **inputs, 
                max_new_tokens=150,
                repetition_penalty=1.2, # Döngüyü kırmak için şart
                do_sample=True,
                temperature=0.7
            )
        
        res = tokenizer.decode(output[0], skip_special_tokens=True)[len(msg):].strip()
        print(f"🤖 AOXCAN: {res}")

except Exception as e:
    print(f"❌ HATA: {e}")
    print("💡 İpucu: BASE_MODEL_LOCAL_PATH içinde config.json olduğundan emin ol.")
