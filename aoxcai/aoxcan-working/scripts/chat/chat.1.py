import torch, sys, os, time
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig
from peft import PeftModel

# --- AOXCAN IDENTITY SETTINGS ---
MODEL_IDENTITY = "aoxcan-core-XLYR-002"
SYSTEM_NAME = "AOXCAN NEURAL DIVISION"
VERSION = "4.7-STABLE-TUNING"

# Terminal Aesthetic Colors
CYAN, GREEN, BLUE, PURPLE, RED, RESET, BOLD = "\033[96m", "\033[92m", "\033[94m", "\033[95m", "\033[91m", "\033[0m", "\033[1m"

def print_audit_banner(hw):
    os.system('clear' if os.name == 'posix' else 'cls')
    banner = f"""
    {BLUE}{BOLD}
    ╔════════════════════════════════════════════════════════════════════════╗
    ║  {CYAN}█▀█ █▀█ ▀▄▀ █▀▀ ▄▀█ █▄░█   █▄░█ █▀▀ █░█ █▀█ ▄▀█ █░░   █▀▀ █▀█ █▀█ █▀▀{BLUE}  ║
    ║  {CYAN}█▀▄ █▄█ █░█ █▄▄ █▀█ █░▀█   █░▀█ ██▄ █▄█ █▀▄ █▀█ █▄▄   █▄▄ █▄█ █▀▄ ██▄{BLUE}  ║
    ╠════════════════════════════════════════════════════════════════════════╣
    ║  {GREEN}CORE_ID: {MODEL_IDENTITY.upper()}     {GREEN}SYSTEM: {SYSTEM_NAME}     ║
    ║  {GREEN}VERSION: {VERSION}                 {GREEN}ENGINE: {hw.upper()} MODE       ║
    ╚════════════════════════════════════════════════════════════════════════╝{RESET}
    """
    print(banner)

def start_audit_engine():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print_audit_banner(device)
    dtype = torch.float16 if device == "cuda" else torch.float32
    
    base_model = "HuggingFaceTB/SmolLM2-135M-Instruct"
    adapter_path = "../outputs/aoxcan-core-XLYR-002-SN20260305/checkpoint-25"

    try:
        tk = AutoTokenizer.from_pretrained(base_model)
        md = AutoModelForCausalLM.from_pretrained(base_model, torch_dtype=dtype, device_map=None, low_cpu_mem_usage=True)
        md = PeftModel.from_pretrained(md, adapter_path).merge_and_unload().to(device).eval()

        # --- STABLE TUNING PARAMETERS ---
        # Bu değerleri modelin verdiği saçma cevaplara göre daraltacağız.
        current_temp = 0.01  # Neredeyse sıfır yaratıcılık, sadece en güçlü olasılık.
        current_top_p = 0.8  # Kelime havuzunu daraltıyoruz.

        print(f"{GREEN}[✔] TUNING ENGINE ONLINE. TEMP: {current_temp} | TOP_P: {current_top_p}{RESET}")
        print(f"{CYAN}{'='*76}{RESET}")

        while True:
            try:
                query = input(f"{BOLD}{CYAN}AOXC-TUNER@ROOT:~$ {RESET}")
                if not query: continue
                if query.lower() in ["exit", "quit"]: break

                # Parametre Güncelleme Komutu (Örn: set temp 0.5)
                if query.startswith("set "):
                    parts = query.split()
                    if parts[1] == "temp": current_temp = float(parts[2])
                    if parts[1] == "top_p": current_top_p = float(parts[2])
                    print(f"{GREEN}[!] PARAMETERS UPDATED: TEMP={current_temp}, TOP_P={current_top_p}{RESET}")
                    continue

                prompt = f"<|im_start|>user\n{query}<|im_end|>\n<|im_start|>assistant\n"
                inputs = tk(prompt, return_tensors="pt").to(device)

                with torch.no_grad():
                    tokens = md.generate(
                        **inputs,
                        max_new_tokens=256,
                        temperature=current_temp,
                        top_p=current_top_p,
                        do_sample=True if current_temp > 0 else False,
                        repetition_penalty=1.3 # Tekrarı daha sert engelliyoruz
                    )

                response = tk.decode(tokens[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
                print(f"\n{PURPLE}{BOLD}[{MODEL_IDENTITY.upper()}]:{RESET} {response.strip()}")
                print(f"{CYAN}{'-' * 76}{RESET}")

            except KeyboardInterrupt: break
    except Exception as e:
        print(f"\n{RED}[!] ERROR: {str(e)}{RESET}")

if __name__ == "__main__":
    start_audit_engine()
