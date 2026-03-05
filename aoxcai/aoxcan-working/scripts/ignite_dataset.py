import os
import json

def generate_sovereign_dataset():
    # Sizin tree yapınıza göre yolları kesinleştiriyoruz
    # Script scripts içinde olduğu için bir üst dizine çıkıp titan_train_data'ya bakıyoruz
    current_script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_script_dir)
    
    base_path = os.path.join(project_root, "titan_train_data")
    output_file = os.path.join(current_script_dir, "data/master_train_titan_v18.jsonl")
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # ÖĞRENME HİYERARŞİSİ (Tree yapındaki klasör isimleriyle birebir)
    training_order = [
        "aoxc_src", "evm_kernel", "xlayer_specs", 
        "rust_kernel", "solidity_specs", "token", "access", "proxy", "utils"
    ]

    entry_count = 0
    print(f"[*] AOXCAN Project Root: {project_root}")
    print(f"[*] Targeted Base Path: {base_path}")

    with open(output_file, "w", encoding="utf-8") as f_out:
        for folder in training_order:
            folder_path = os.path.join(base_path, folder)
            
            if not os.path.exists(folder_path):
                print(f"[!] Layer missing, skipping: {folder.upper()}")
                continue
            
            print(f"[*] Infusing Layer: {folder.upper()}")
            
            for root, _, files in os.walk(folder_path):
                for file in files:
                    # Tree yapındaki tüm teknik uzantıları kapsıyoruz
                    if file.endswith((".sol", ".rs", ".go", ".json", ".rst", ".md")):
                        file_path = os.path.join(root, file)
                        try:
                            with open(file_path, "r", encoding="utf-8") as f_in:
                                content = f_in.read()
                                if not content.strip(): continue
                            
                            role_map = {
                                "aoxc_src": "CORE_IDENTITY_AND_LOGIC",
                                "evm_kernel": "PHYSICAL_EVM_OPCODES",
                                "xlayer_specs": "X_LAYER_NETWORK_PROTOCOL",
                                "rust_kernel": "MEMORY_SAFETY_DYNAMICS",
                                "solidity_specs": "LANGUAGE_SYNTAX_RULES"
                            }
                            role = role_map.get(folder, "TECHNICAL_STANDARDS")
                            
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
