import os
import torch
import datetime
import json
import sys
import time
from pathlib import Path
from transformers import (
    AutoModelForCausalLM, 
    AutoTokenizer, 
    TrainingArguments, 
    Trainer, 
    DataCollatorForLanguageModeling
)
from datasets import load_dataset
from peft import LoraConfig, get_peft_model

# --- [🆔 SOVEREIGN IDENTITY & OFFLINE PATHS] ---
MODEL_NAME = "AOXCAN-XLY-OKB-001"
CURRENT_DATE = datetime.datetime.now().strftime("%Y%m%d")

SCRIPTS_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPTS_DIR.parent.absolute()

# Yolları string olarak mühürle
MODEL_HUB_PATH = str(PROJECT_ROOT / "model_hub")
DATA_FILE = str(SCRIPTS_DIR / "data" / "master_train_titan_v18.jsonl")
OUTPUT_DIR = str(PROJECT_ROOT / "outputs" / "sovereign_series" / f"{MODEL_NAME}-SN{CURRENT_DATE}")

def terminal_banner():
    os.system('clear')
    print("\033[1;36m" + "="*75 + "\033[0m")
    print("\033[1;32m" + "       🛡️  AOXCAN NEURAL GENESIS ENGINE v2.3 [STRICT-LOCAL]  🛡️" + "\033[0m")
    print("\033[1;36m" + "="*75 + "\033[0m")
    print(f"\033[1;33m IDENTITY  :\033[0m {MODEL_NAME}")
    print(f"\033[1;33m MODE      :\033[0m FULL-LOCAL (Zero External Calls)")
    print(f"\033[1;33m SOURCE    :\033[0m {MODEL_HUB_PATH}")
    print(f"\033[1;33m STATUS    :\033[0m IGNITING NEURAL CORE...")
    print("\033[1;36m" + "="*75 + "\033[0m\n")
    time.sleep(1)

terminal_banner()

# --- [1. MODEL LOAD (Strictly Local)] ---
print(f"\033[1;34m[*] Infusing Local Intelligence...\033[0m")
try:
    # BYPASS: Bazı modeller 'fast tokenizer' gerektirir ama yerelde 'slow' olanı vardır.
    # use_fast=False ve trust_remote_code=True kombinasyonu bu hatayı ezer.
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_HUB_PATH, 
        local_files_only=True, 
        trust_remote_code=True,
        use_fast=False  # Hatayı veren 'fast' dönüşümünü iptal ediyoruz
    )
    
    # Tokenizer ayarlarını mühürle
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_HUB_PATH,
        local_files_only=True,
        device_map={"": "cpu"},
        trust_remote_code=True,
        torch_dtype=torch.float32
    )
except Exception as e:
    print(f"\033[1;31m❌ [CRITICAL] Yerel Model Yüklenemedi!\033[0m")
    print(f"Hata detayı: {e}")
    print("\033[1;33mİPUCU: 'pip install sentencepiece' yüklü olduğundan ve terminali yeniden başlattığından emin ol.\033[0m")
    sys.exit(1)

# --- [2. RECURSIVE JUSTICE LoRA] ---
lora_config = LoraConfig(
    r=32, 
    lora_alpha=64,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj", "gate_proj"], 
    lora_dropout=0.01,
    bias="none",
    task_type="CAUSAL_LM"
)
model = get_peft_model(model, lora_config)

# --- [3. DATASET PREP] ---
print(f"\033[1;34m[*] Infusing 523 Sovereign Files from Data Matrix...\033[0m")
try:
    dataset = load_dataset("json", data_files=DATA_FILE, split="train")
    tokenized_ds = dataset.map(
        lambda x: tokenizer(x["text"], truncation=True, max_length=256, padding="max_length"), 
        batched=True
    )
except Exception as e:
    print(f"\033[1;31m❌ [DATA HATA] Veriseti hatası: {e}\033[0m")
    sys.exit(1)

# --- [4. AWAKENING PARAMETERS] ---
train_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=16,
    learning_rate=3e-5,
    num_train_epochs=7,
    save_strategy="epoch",
    logging_steps=1,
    optim="adamw_torch",
    use_cpu=True,
    gradient_checkpointing=True,
    report_to="none"
)

# --- [5. IGNITION] ---
trainer = Trainer(
    model=model,
    args=train_args,
    train_dataset=tokenized_ds,
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
)

print(f"\033[1;31m🔥 [OFFLINE IGNITION] {MODEL_NAME} is awakening...\033[0m\n")
trainer.train()

# --- [6. THE FINAL SEAL] ---
os.makedirs(OUTPUT_DIR, exist_ok=True)
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

seal_data = {
    "identity": MODEL_NAME,
    "source": "Local-Hub-Sovereign",
    "mission": "Autonomous Integrity & Justice",
    "serial": f"SN{CURRENT_DATE}-GEN001",
    "status": "SOVEREIGN",
    "timestamp": str(datetime.datetime.now())
}
with open(os.path.join(OUTPUT_DIR, "GENESIS_SEAL.json"), "w") as f:
    json.dump(seal_data, f, indent=4)

print("\n\033[1;32m" + "="*75 + "\033[0m")
print(f"✅ [SUCCESS] {MODEL_NAME} HAS AWAKENED AND SEALED.")
print(f"📂 LOCATION: {OUTPUT_DIR}")
print("\033[1;32m" + "="*75 + "\033[0m\n")
