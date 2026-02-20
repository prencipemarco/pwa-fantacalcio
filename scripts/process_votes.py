import pandas as pd
import os
import glob
import sys

# Directories
INPUT_DIR = '/Volumes/Crucial X6/workspace/web/pwa-fantacalcio/scripts/xlsx/voti'
OUTPUT_DIR = '/Volumes/Crucial X6/workspace/web/pwa-fantacalcio/scripts/csv/voti'

def process_votes():
    # Ensure output exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Explicitly remove voti_21.csv if it exists (as requested)
    target_21 = os.path.join(OUTPUT_DIR, 'voti_21.csv')
    if os.path.exists(target_21):
        try:
            os.remove(target_21)
            print("Removed existing voti_21.csv")
        except OSError as e:
            print(f"Error removing voti_21.csv: {e}")

    # Loop matchdays 1 to 22
    for i in range(1, 23):
        input_filename = f'Voti_Fantacalcio_Stagione_2025_26_Giornata_{i}.xlsx'
        input_path = os.path.join(INPUT_DIR, input_filename)
        
        output_filename = f'voti_{i}.csv'
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        if os.path.exists(input_path):
            print(f"[{i}/22] Processing {input_filename} -> {output_filename} ...")
            try:
                # Read Excel with no header to preserve exact structure
                # Because the file has interspersed headers ("Atalanta", "Cod."), pandas default header logic would fail or mess up.
                # Reading as raw data (header=None) keeps mixed types, which helps preserve Integers (0 vs 0.0) in object columns.
                df = pd.read_excel(input_path, header=None)
                
                # Check formatting
                # We expect columns to largely be clean. 
                # to_csv with sep=';'
                # index=False, header=False
                df.to_csv(output_path, sep=';', index=False, header=False)
                
            except Exception as e:
                print(f"Error converting {input_filename}: {e}")
        else:
            print(f"Warning: File not found {input_filename}")

    print("Processing complete.")

if __name__ == "__main__":
    process_votes()
