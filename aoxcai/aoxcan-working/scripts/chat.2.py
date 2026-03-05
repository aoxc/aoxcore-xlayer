import torch, sys, os, time, select
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
from peft import PeftModel
from threading import Thread

# --- IDENTITY ---
MODEL_IDENTITY = "aoxcan-core-XLYR-002"
ADAPTER = "../outputs/aoxcan-core-XLYR-002-SN20260305/checkpoint-25"
BASE_MODEL = "HuggingFaceTB/SmolLM2-135M-Instruct"

# Colors
CYAN, GREEN, BLUE, PURPLE, RED, RESET, BOLD, YELLOW = "\033[96m", "\033[92m", "\033[94m", "\033[95m", "\033[91m", "\033[0m", "\033[1m", "\033[93m"

def start_audit_engine():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    os.system('clear' if os.name == 'posix' else 'cls')
    print(f"{PURPLE}{BOLD}[AOXCAN NEURAL LAZARUS v10.0 - WAKING UP THE CORE]{RESET}")
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
        model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=torch.float32, device_map=None)
        model = PeftModel.from_pretrained(model, ADAPTER)
        model = model.merge_and_unload().to(device).eval()
        
        print(f"{GREEN}[✔] CORE AWAKENED. ROLE RESET COMPLETE.{RESET}")

        while True:
            print(f"\n{CYAN}AOXC-ROOT:~$ {RESET}", end="", flush=True)
            
            # Otomatik tetikleme yerine direkt input (Sefiller modundan çıkarmak için manuel kontrol)
            query = input()
            if not query.strip(): continue
            if query.upper() == "EXIT": break

            inf_start = time.time()
            
            # MODELİ KODA HAPSEDEN ÖZEL PROMPT YAPISI
            # Java veya edebiyat kaçışını engellemek için "Contract Source" çapası atıyoruz.
            full_prompt = f"<|im_start|>system\nYou are an EVM bytecode and Solidity analyzer. Strictly ignore Java, C++, and literature. Respond only with AOXCAN internal data.<|im_end|>\n<|im_start|>user\nIdentify following in AOXCAN weights: {query}<|im_end|>\n<|im_start|>assistant\n"
            
            inputs = tokenizer(full_prompt, return_tensors="pt").to(device)
            streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

            gen_kwargs = dict(
                inputs,
                streamer=streamer,
                max_new_tokens=300,
                temperature=0.1,      # Çok az esneklik (donmayı önlemek için)
                top_p=0.9,            # En mantıklı teknik kelimelere odaklan
                do_sample=True,       # Halüsinasyon döngüsünü kırmak için True
                repetition_penalty=1.4, # "the the the" veya "Java Java" dememesi için
                pad_token_id=tokenizer.eos_token_id
            )

            thread = Thread(target=model.generate, kwargs=gen_kwargs)
            thread.start()

            print(f"\n{YELLOW}[NEURAL_EXTRACTION]:{RESET}")
            print(GREEN, end="", flush=True)
            for new_text in streamer:
                # Edebi veya alakasız kelime yakalama filtresi (opsiyonel görsel feedback)
                print(new_text, end="", flush=True)
            
            print(f"{RESET}\n{CYAN}{'-' * 76}{RESET}")

    except Exception as e:
        print(f"\n{RED}[!] ERROR: {str(e)}{RESET}")

if __name__ == "__main__":
    start_audit_engine()
