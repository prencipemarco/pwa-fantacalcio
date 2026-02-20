import pandas as pd

FILE = '/Volumes/Crucial X6/workspace/web/pwa-fantacalcio/src/xlsx/voti/Voti_Fantacalcio_Stagione_2025_26_Giornata_1.xlsx'

try:
    df = pd.read_excel(FILE)
    print("Columns:", df.columns.tolist())
    print("First 10 rows:")
    print(df.head(10))
except Exception as e:
    print(e)
