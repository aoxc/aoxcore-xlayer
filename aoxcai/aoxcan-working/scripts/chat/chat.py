import torch, sys, os, time
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig
from peft import PeftModel

# --- AOXCAN IDENTITY SETTINGS ---
MODEL_IDENTITY = "aoxcan-core-XLYR-002"
SYSTEM_NAME = "AOXCAN NEURAL DIVISION"
VERSION = "4.6-DEBUG-STABLE"

# Terminal Aesthetic Colors
CYAN, GREEN, BLUE, PURPLE, RED, RESET, BOLD = "\033[96m", "\033[92m", "\033[94m", "\033[95m", "\033[91m", "\033[0m", "\033[1m"

def print_audit_banner(hw):
    os.system('clear' if os.name == 'posix' else 'cls')
    banner = f"""
    {BLUE}{BOLD}
    ╔═════════════════════════════════════════════════════════════════════=============═══╗
    ║  {CYAN}█▀█ █▀█ ▀▄▀ █▀▀ ▄▀█ █▄░█   █▄░█ █▀▀ █░█ █▀█ ▄▀█ █░░   █▀▀ █▀█ █▀█ █▀▀{BLUE}  ║
    ║  {CYAN}█▀▄ █▄█ █░█ █▄▄ █▀█ █░▀█   █░▀█ ██▄ █▄█ █▀▄ █▀█ █▄▄   █▄▄ █▄█ █▀▄ ██▄{BLUE}  ║
    ╠════════════════════════════════════════════════════════════════════==============═══╣
    ║  {GREEN}CORE_ID: {MODEL_IDENTITY.upper()}     {GREEN}SYSTEM: {SYSTEM_NAME}          ║
    ║  {GREEN}VERSION: {VERSION}                 {GREEN}ENGINE: {hw.upper()} MODE         ║
    ╚════════════════════════════════════════════════════════════════════════╝{RESET}=====
    """
    print(banner)

def start_audit_engine():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print_audit_banner(device)
    
    # CPU için float32, GPU için float16 - En kararlı mod.
    dtype = torch.float16 if device == "cuda" else torch.float32
    
    base_model = "HuggingFaceTB/SmolLM2-135M-Instruct"
    adapter_path = "../outputs/aoxcan-core-XLYR-002-SN20260305/checkpoint-25"

    try:
        print(f"{BLUE}[*] LOADING TOKENIZER...{RESET}")
        tokenizer = AutoTokenizer.from_pretrained(base_model)
        
        print(f"{BLUE}[*] LOADING MODEL INTO {device.upper()}...{RESET}")
        model = AutoModelForCausalLM.from_pretrained(
            base_model,
            torch_dtype=dtype,
            device_map=None, # CPU modunda manuel kontrol için
            low_cpu_mem_usage=True
        )

        print(f"{BLUE}[*] ATTACHING NEURAL ADAPTER...{RESET}")
        model = PeftModel.from_pretrained(model, adapter_path)
        model = model.merge_and_unload()
        model = model.to(device)
        model.eval()

        gen_config = GenerationConfig(
            max_new_tokens=128, # Panic'i önlemek için çıktıyı kısalttık
            temperature=0.1,
            repetition_penalty=1.2,
            pad_token_id=tokenizer.eos_token_id
        )

        print(f"{GREEN}[✔] SYSTEM READY.{RESET}")
        print(f"{CYAN}{'='*76}{RESET}")

        while True:
            try:
                query = input(f"{BOLD}{CYAN}AOXC-AUDIT@ROOT:~$ {RESET}")
                if not query: continue
                if query.lower() in ["exit", "quit"]: break

                # Manuel chat formatı (Template hatalarını önlemek için)
                prompt = f"<|im_start|>user\n{query}<|im_end|>\n<|im_start|>assistant\n"
                inputs = tokenizer(prompt, return_tensors="pt").to(device)

                with torch.no_grad():
                    tokens = model.generate(**inputs, generation_config=gen_config)

                response = tokenizer.decode(tokens[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
                
                print(f"\n{PURPLE}{BOLD}[{MODEL_IDENTITY.upper()}]:{RESET} {response.strip()}")
                print(f"{CYAN}{'-' * 76}{RESET}")

            except KeyboardInterrupt: break

    except Exception as e:
        print(f"\n{RED}[!] KERNEL_PANIC_REASON: {str(e)}{RESET}")

if __name__ == "__main__":
    start_audit_engine()
