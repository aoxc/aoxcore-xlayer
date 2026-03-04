from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()

def get_web3():
    rpc_url = os.getenv("RPC_URL")
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if w3.is_connected():
        return w3
    else:
        raise Exception("X Layer bağlantısı kurulamadı!")
