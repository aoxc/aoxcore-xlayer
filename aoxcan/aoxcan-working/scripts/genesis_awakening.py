import os
import sys
import json
import logging
import torch
from datetime import datetime
from typing import Optional

from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
    TrainerCallback,
    set_seed
)
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, TaskType

# --- [💠 SOVEREIGN OFFLINE SHIELD] ---
os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Kimlik ve Zaman Damgası
MODEL_IDENTITY = "AOXCAN-XLY-OKB-001-GENESIS"
TIMESTAMP = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

set_seed(42)

# Audit Loglama Sistemi
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("AGILE-GUARDIAN-AUDIT")

# --- [📂 DIRECTORY MAPPING] ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SCRIPT_DIR)
TOKENIZER_DIR = os.path.join(SCRIPT_DIR, "aoxcan_tokenizer")
BASE_MODEL_PATH = os.path.join(BASE_DIR, "model_hub")
DATA_SOURCE = os.path.join(SCRIPT_DIR, "data/master_train_sovereign_v18.jsonl")
OUTPUT_DIR = os.path.join(BASE_DIR, f"outputs/{MODEL_IDENTITY}")

class SovereignProgressCallback(TrainerCallback):
    """Görsel İlerleme Takipçisi"""
    def on_step_end(self, args, state, control, **kwargs):
        if state.max_steps > 0:
            progress = (state.global_step / state.max_steps) * 100
            filled = int(40 * state.global_step // state.max_steps)
            bar = '█' * filled + '░' * (40 - filled)
            sys.stdout.write(
                f'\r\033[1;32m[SYNERGY-STATUS]\033[0m \033[1;36m{bar}\033[0m '
                f'\033[1;33m{progress:>6.2f}%\033[0m | '
                f'\033[1;34mStep: {state.global_step}/{state.max_steps}\033[0m'
            )
            sys.stdout.flush()

def display_audit_banner():
    os.system('clear')
    banner = f"""
    \033[1;33m╔{"═" * 75}╗
    ║   █████╗  ██████╗ ██╗  ██╗ ██████╗  █████╗  ███╗   ██╗ [OKB-001]     ║
    ║  ██╔══██╗██╔═══██╗╚██╗██╔╝██╔════╝ ██╔══██╗ ████╗  ██║  AGILE        ║
    ║  ███████║██║   ██║ ╚███╔╝ ██║      ███████║ ██╔██╗ ██║  GUARDIAN     ║
    ║  ██╔══██║██║   ██║ ██╔██╗ ██║      ██╔══██║ ██║╚██╗██║  GENESIS      ║
    ║  ██║  ██║╚██████╔╝██╔╝ ██╗╚██████╗ ██║  ██║ ██║ ╚████║  X-LAYER      ║
    ╠{"═" * 75}╣
    ║       [ INITIALIZING NEURAL SOVEREIGNTY | {MODEL_IDENTITY} ]      ║
    ╚{"═" * 75}╝\033[0m
    """
    print(banner)

# --- [🧠 NEURAL CORE INITIALIZATION] ---
display_audit_banner()
logger.info("Initializing Core Architecture (Offline & Grok-Tweak Optimized)...")

try:
    tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_DIR, local_files_only=True)
    
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_PATH,
        torch_dtype=torch.float32,
        device_map="cpu",
        trust_remote_code=True,
        local_files_only=True
    )
    
    model.resize_token_embeddings(len(tokenizer))

    lora_config = LoraConfig(
        r=32,
        lora_alpha=64,
        target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type=TaskType.CAUSAL_LM
    )
    
    model = get_peft_model(model, lora_config)
    model.gradient_checkpointing_enable()

except Exception as e:
    logger.error(f"Failed to load neural components: {str(e)}")
    sys.exit(1)

# --- [📊 DATASET INGESTION] ---
logger.info("Ingesting Sovereign Training Components...")
dataset = load_dataset("json", data_files={"train": DATA_SOURCE}, split="train")

def preprocess_function(examples):
    return tokenizer(
        examples["text"], 
        truncation=True, 
        max_length=256, 
        padding="max_length"
    )

tokenized_dataset = dataset.map(
    preprocess_function, 
    batched=True, 
    remove_columns=["text"],
    desc="Processing Training Data"
)

# --- [🚀 SOVEREIGN TRAINING ENGINE - GROK TWEAK VERSION] ---
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=8,
    num_train_epochs=6,
    
    # GROK TWEAK: Refinement için hassas öğrenme ayarları
    learning_rate=8e-5,          # 1e-4'ten daha kontrollü bir seviyeye çekildi
    lr_scheduler_type="cosine",  # Sert düşüşler yerine yumuşak sönümleme
    warmup_ratio=0.05,           # Başlangıçta stabilite için
    weight_decay=0.02,           # 7. Persona (Registry) çapasını güçlendirmek için artırıldı
    
    logging_steps=1,
    save_strategy="epoch",
    save_total_limit=3,
    report_to="none",
    use_cpu=True,
    disable_tqdm=True,
    logging_first_step=True,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False),
    callbacks=[SovereignProgressCallback()]
)

# --- [⚡ RESUMPTION LOGIC] ---
logger.info(f"Verification Phase: Searching for Neural Seals in {OUTPUT_DIR}")

try:
    checkpoint_to_resume = None
    if os.path.exists(OUTPUT_DIR):
        checkpoints = [os.path.join(OUTPUT_DIR, d) for d in os.listdir(OUTPUT_DIR) if "checkpoint-" in d]
        if checkpoints:
            checkpoint_to_resume = max(checkpoints, key=os.path.getmtime)

    if checkpoint_to_resume:
        logger.info(f"Existing Seal Detected: Resuming Synthesis from {checkpoint_to_resume}")
        trainer.train(resume_from_checkpoint=checkpoint_to_resume)
    else:
        logger.info("No previous seal found. Starting fresh Genesis Synthesis.")
        trainer.train()

    # --- [💾 SEALING PHASE] ---
    logger.info(f"Sealing Final Agile Guardian Core at: {OUTPUT_DIR}")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    manifest = {
        "identity": MODEL_IDENTITY,
        "classification": "Agile Guardian",
        "protocol": "GENESIS-001",
        "sovereign_status": "AWAKENED",
        "last_sync": TIMESTAMP,
        "audit_report": "GROK_TWEAK_STABLE_SYNTHESIS"
    }
    
    with open(os.path.join(OUTPUT_DIR, "GUARDIAN_MANIFEST.json"), "w") as f:
        json.dump(manifest, f, indent=4)

    print(f"\n\n\033[1;32m✅ [SYSTEM CONFIRMED] {MODEL_IDENTITY} AWAKENING SUCCESSFUL.\033[0m")

except KeyboardInterrupt:
    logger.warning("\nManual Interruption. Progress preserved.")
except Exception as e:
    logger.error(f"Critical Synthesis Failure: {str(e)}")
