import os
import json

def generate_sovereign_dataset():
    base_path = "titan_train_data"
    output_file = "data/master_train_titan_v18.jsonl"
    os.makedirs("data", exist_ok=True)

    # TITAN'IN ÖĞRENME HİYERARŞİSİ (Kritik Sıralama)
    training_order = [
        "aoxc_src",      # En üste anayasa ve ana mantık gelsin
        "evm_kernel",    # Sonra fiziksel kurallar
        "xlayer_specs",  # Sonra ağın refleksleri
        "rust_kernel",   # Sonra bellek güvenliği
        "solidity_specs",# Sonra dil bilgisi
        "token", "access", "proxy", "utils" # En son kütüphane standartları
    ]

    entry_count = 0
    with open(output_file, "w", encoding="utf-8") as f_out:
        for folder in training_order:
            folder_path = os.path.join(base_path, folder)
            if not os.path.exists(folder_path): continue
            
            print(f"[*] Infusing Layer: {folder.upper()}")
            for root, _, files in os.walk(folder_path):
                for file in files:
                    # Tüm dilleri kapsıyoruz
                    if file.endswith((".sol", ".rs", ".go", ".json", ".rst", ".md")):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, "r", encoding="utf-8") as f_in:
                                content = f_in.read()
                            
                            # İCAT: Metadata Tagging (Modelin 'neden' okuduğunu bilmesi için)
                            role_map = {
                                "aoxc_src": "CORE_IDENTITY_AND_LOGIC",
                                "evm_kernel": "PHYSICAL_EVM_OPCODES",
                                "xlayer_specs": "X_LAYER_NETWORK_PROTOCOL",
                                "rust_kernel": "MEMORY_SAFETY_DYNAMICS",
                                "solidity_specs": "LANGUAGE_SYNTAX_RULES"
                            }
                            role = role_map.get(folder, "TECHNICAL_STANDARDS")
                            
                            # İCAT: Constitution Prefixing (Anayasayı her veriye 'ruh' olarak ekliyoruz)
                            entry = {
                                "text": f"### IDENTITY: AOXCAN-XLY-OKB-001\n### ARCHITECTURE: SOVEREIGN_EVM\n### ROLE: {role}\n### FILE: {file}\n### CONTENT:\n{content}\n### VALIDATION: Justice is the Core of {file}."
                            }
                            f_out.write(json.dumps(entry, ensure_ascii=False) + "\n")
                            entry_count += 1
                        except Exception as e:
                            print(f"Skipping {file}: {e}")

    print(f"\n💎 TITAN SOVEREIGN DATASET READY: {entry_count} files infused into {output_file}")

if __name__ == "__main__":
    generate_sovereign_dataset()
