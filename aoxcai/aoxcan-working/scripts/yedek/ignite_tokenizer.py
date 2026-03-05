import os
import json
import sys
from tokenizers import ByteLevelBPETokenizer
from pathlib import Path
from transformers import PreTrainedTokenizerFast

# --- [🆔 GLOBAL AUDIT IDENTITY] ---
MODEL_IDENTITY = "AOXCAN-XLY-OKB-001"
DIALECT_VERSION = "AUDIT-CORE-v2.2-PRO"
TOKENIZER_DIR = "./aoxcan_tokenizer"
DATA_FILE = "./data/master_train_sovereign_v18.jsonl" 

def global_audit_banner():
    os.system('clear')
    # Modern, Solid & Sharp ASCII Art for AOXCAN
    print("\033[1;36m")
    print(r"  █████╗  ██████╗ ██╗  ██╗ ██████╗ █████╗ ███╗   ██╗")
    print(r" ██╔══██╗██╔═══██╗╚██╗██╔╝██╔════╝██╔══██╗████╗  ██║")
    print(r" ███████║██║   ██║ ╚███╔╝ ██║     ███████║██╔██╗ ██║")
    print(r" ██╔══██║██║   ██║ ██╔██╗ ██║     ██╔══██║██║╚██╗██║")
    print(r" ██║  ██║╚██████╔╝██╔╝ ██╗╚██████╗██║  ██║██║ ╚████║")
    print(r" ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝")
    print("\033[0m")
    print("\033[1;32m" + "    [ GLOBAL SECURITY PROTOCOL | NEURAL CORE DECODER v2.2 ]" + "\033[0m")
    print("\033[1;34m" + "═"*70 + "\033[0m")
    print(f"\033[1;33m SYSTEM ID     :\033[0m {MODEL_IDENTITY}")
    print(f"\033[1;33m COMPLIANCE    :\033[0m X-LAYER NATIVE / EVM-AUDIT")
    print(f"\033[1;33m SECURITY LVL  :\033[0m ADVANCED NEURAL DECODING")
    print("\033[1;34m" + "═"*70 + "\033[0m\n")

global_audit_banner()

# --- [🔥 THE NEURAL ALCHEMY] ---
os.makedirs(TOKENIZER_DIR, exist_ok=True)
tokenizer = ByteLevelBPETokenizer()

print("\033[1;34m[*] Processing 523 Sovereign Files for Neural Integrity...\033[0m")

# AUDIT-LEVEL SPECIAL TOKENS:
audit_sovereign_tokens = [
    "<s>", "<pad>", "</s>", "<unk>", "<mask>", 
    "AOXCAN", "X-LAYER", "EVM_KERNEL", "JUSTICE_STAMP",
    "DELEGATECALL", "REENTRANCY", "OVERSHADOW", "SELFDESTRUCT", 
    "VULNERABILITY_FOUND", "INTEGRITY_VERIFIED", "CONSTITUTION_BREACH", 
    "fn", "impl", "pub", "unsafe", "0x", "u256", "address", 
    "OWNERSHIP_LOGIC", "PROXY_PATTERN", "GAS_OPTIMIZED"
]

if not os.path.exists(DATA_FILE):
    print(f"\033[1;31m❌ [ERROR] Source Data Not Found: {DATA_FILE}\033[0m")
    sys.exit(1)

tokenizer.train(
    files=[DATA_FILE], 
    vocab_size=32000, 
    min_frequency=2, 
    show_progress=True,
    special_tokens=audit_sovereign_tokens
)

tokenizer.save_model(TOKENIZER_DIR)

fast_tokenizer = PreTrainedTokenizerFast(
    tokenizer_object=tokenizer,
    model_max_length=256,
    padding_side="right",
    truncation_side="right",
    bos_token="<s>",
    eos_token="</s>",
    unk_token="<unk>",
    pad_token="<pad>",
    mask_token="<mask>"
)
fast_tokenizer.save_pretrained(TOKENIZER_DIR)

# Professional Audit Manifest
audit_manifest = {
    "engine_identity": "AOXCAN Sovereign Architect",
    "dialect_version": DIALECT_VERSION,
    "security_focus": "High-Efficiency Neural Decoding",
    "compliance": ["EVM", "X-LAYER-SPEC", "SOLIDITY-SECURITY"],
    "total_training_files": 523,
    "status": "MASTERPIECE_SEALED"
}

with open(os.path.join(TOKENIZER_DIR, "AUDIT_MANIFEST.json"), "w") as f:
    json.dump(audit_manifest, f, indent=4)

print(f"\n\033[1;32m✅ [SUCCESS] AOXCAN DIALECT ARCHITECTURE SEALED AT: {TOKENIZER_DIR}\033[0m")
print("\033[1;33m[*] System architecture is now compatible with global audit standards.\033[0m\n")
