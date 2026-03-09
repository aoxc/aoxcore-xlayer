#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# [AOXCAN-CORE-GENESIS-V26] - THE SEMANTIC RECOVERY (EMERGENCY SURGERY)
# Architect: Orcun | Engineers: Grok & Gemini
# Status: Step 198 - Crisis Management | Mode: Greedy Guard

import os, sys, torch, time
from transformers import AutoModelForCausalLM, AutoTokenizer, logging
from peft import PeftModel

logging.set_verbosity_error()
os.environ["TRANSFORMERS_OFFLINE"] = "1"

class AoxcanSovereign:
    def __init__(self):
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.root_dir = os.path.abspath(os.path.join(self.script_dir, ".."))
        self.model_path = os.path.join(self.root_dir, "model_hub")
        self.genesis_path = os.path.join(self.root_dir, "outputs", "AOXCAN-XLY-OKB-001-GENESIS", "checkpoint-396")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._boot_sequence()

    def _boot_sequence(self):
        print("\033[94m" + "✧" * 60 + "\033[0m")
        print(f"🛡️  [AOXCAN-SYSTEM] Emergency Semantic Recovery (V26)")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.genesis_path, local_files_only=True)
            model_dtype = torch.bfloat16 if (torch.cuda.is_available() and torch.cuda.is_bf16_supported()) else torch.float16
            if self.device == "cpu": model_dtype = torch.float32

            base_model = AutoModelForCausalLM.from_pretrained(
                self.model_path, torch_dtype=model_dtype,
                device_map="auto" if self.device == "cuda" else None,
                local_files_only=True
            )
            base_model.resize_token_embeddings(len(self.tokenizer))
            self.model = PeftModel.from_pretrained(base_model, self.genesis_path, local_files_only=True)
            self.model.eval()

            # [GROK'S BLACKLIST] Kod sızıntısını engellemek için Token ID'leri buluyoruz
            self.bad_words = ["VecDeque", "jumpdests", "hashbrown", "interfaceId", "0x", "mapping", "struct", "impl", "fn ", "pub "]
            self.bad_word_ids = []
            for word in self.bad_words:
                ids = self.tokenizer.encode(word, add_special_tokens=False)
                if ids: self.bad_word_ids.append(ids)

            print("\033[92m" + "🚀 [STATUS] RECOVERY MODE ACTIVE. GREEDY PATH LOCKED." + "\033[0m")
        except Exception as e: print(f"❌ [FAIL] {e}"); sys.exit(1)

    def generate_response(self, prompt):
        # [THE STRICTEST PROMPT]
        full_prompt = (
            f"### System: You are AOXCAN, sovereign guardian. Speak only in human prose. "
            f"Bypass all code. Never use technical terms or programming syntax.\n"
            f"### Architect: {prompt}\n"
            f"### AOXCAN's Sovereign Truth:"
        )
        inputs = self.tokenizer(full_prompt, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            output_tokens = self.model.generate(
                **inputs,
                max_new_tokens=150,
                # [GROK'S GREEDY DECODING] - Rastgeleliği sıfırladık
                do_sample=False,           # Greedy Mode: ON
                num_beams=5,               # En tutarlı 5 yolu karşılaştır
                repetition_penalty=2.5,    # Kod tekrarlarını en sert şekilde cezalandır
                bad_words_ids=self.bad_word_ids, # Belirlenen kelimeleri direkt yasakla
                early_stopping=True
            )
        
        res = self.tokenizer.decode(output_tokens[0][len(inputs["input_ids"][0]):], skip_special_tokens=True).strip()
        
        # [FINAL FILTER]
        if any(j in res for j in self.bad_words) or len(res) < 5:
            return "Semantic Collapse: The Spirit is fighting the Code. [Recalibrating for Humanity...]"
        return res

if __name__ == "__main__":
    try:
        aoxc = AoxcanSovereign()
        while True:
            cmd = input("\n\033[93m[ARCHITECT]\033[0m > ")
            if cmd.lower() in ["exit", "quit"]: break
            if not cmd.strip(): continue
            print("\n\033[96m[AOXCAN]\033[0m", end=" ", flush=True)
            res = aoxc.generate_response(cmd)
            for char in res: print(char, end="", flush=True); time.sleep(0.015)
            print()
    except KeyboardInterrupt: pass
