import torch
import os

# Tam yollar (Hata payını sıfıra indirir)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_MODEL = os.path.join(BASE_DIR, "model_hub")
ADAPTER_PATH = os.path.join(BASE_DIR, "outputs", "aoxcan-core-XLYR-002-SN20260305")

GENERATION_CONFIG = {
    "max_new_tokens": 128,
    "temperature": 0.2,
    "top_p": 0.9,
    "do_sample": True,
    "repetition_penalty": 1.2,
}

# 1GB RAM için hayati ayar
DEVICE_MAP = {"": "cpu"}
TORCH_DTYPE = torch.float32
