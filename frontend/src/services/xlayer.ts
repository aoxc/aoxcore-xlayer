/**
 * @notice İşlemi tam kapsamlı simüle eder.
 * @dev Hem gas tahmini hem de mantıksal doğrulama (Static Call) yapar.
 */
export const simulateTransaction = async (to: string, data: string, value: bigint) => {
  return await throttleRequest(async () => {
    try {
      // Paralel çalıştırma: Hem gas tahmini hem de statik çağrı aynı anda yapılır
      const [gasEstimate, _] = await Promise.all([
        getProvider().estimateGas({ to, data, value }),
        getProvider().call({ to, data, value })
      ]);

      return { 
        success: true, 
        gasEstimate: gasEstimate.toString(),
        risk: "CLEAN",
        timestamp: Date.now()
      };
    } catch (error: any) {
      // Hata mesajını insan diline çevir ve temizle
      let errorMsg = "Transaction Simulation Failed";
      
      if (error.reason) errorMsg = error.reason;
      else if (error.message?.includes("insufficient funds")) errorMsg = "Yetersiz OKB Bakiyesi";
      else if (error.data) errorMsg = `Contract Error: ${error.data.slice(0, 10)}`; // İlk 4 byte hata kodu

      return { 
        success: false, 
        error: errorMsg,
        risk: "HIGH",
        timestamp: Date.now()
      };
    }
  });
};

/**
 * @notice AOXC Prime Asset bakiyesi (Hata durumunda null döner, 0 değil).
 */
export const getAoxcBalance = async (address: string): Promise<string | null> => {
  if (!ethers.isAddress(address)) return "0.00";
  
  return await throttleRequest(async () => {
    try {
      const contract = new Contract(AOXC_TOKEN_ADDRESS, ERC20_ABI, getProvider());
      const balance = await contract.balanceOf(address);
      // AOXC token 18 decimal ise formatUnits(balance, 18)
      return ethers.formatUnits(balance, 18); 
    } catch (e) {
      console.error("CRITICAL_RPC_ERROR: AOXC balance fetch failed.");
      return null; // 0.00 yerine null dönmek, ağ hatasını UI'da göstermeni sağlar
    }
  });
};
