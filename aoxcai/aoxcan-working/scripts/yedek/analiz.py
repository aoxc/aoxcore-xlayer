import json
import matplotlib.pyplot as plt

# Checkpoint yolunu kendi sistemine göre güncelle
path = "outputs/aoxcan-core-XLYR-002-SN20260305/checkpoint-25/trainer_state.json"

with open(path, 'r') as f:
    data = json.load(f)

steps = []
loss = []

for log in data['log_history']:
    if 'loss' in log:
        steps.append(log['step'])
        loss.append(log['loss'])

# Kayıp (Loss) Grafiği Çizimi
plt.figure(figsize=(10, 5))
plt.plot(steps, loss, label='Eğitim Kaybı (Loss)')
plt.xlabel('Adım (Step)')
plt.ylabel('Kayıp (Loss)')
plt.title('AOXCAN Model 2 Eğitim Analizi')
plt.legend()
plt.grid(True)
plt.show()

print(f"Son kaydedilen Loss değeri: {loss[-1] if loss else 'Veri yok'}")
