import pandas as pd
import os
import sys

def convert_excel_to_csv(input_path, output_path):
    print(f"Reading {input_path}...")
    try:
        # Read Excel file
        # Skip top rows if they are metadata (Fantacalcio.it often has 1-2 header rows)
        # We'll try to find the header row that contains 'Id' or 'Cod.'
        df = pd.read_excel(input_path, header=None)
        
        # Find header row
        header_idx = -1
        for i, row in df.iterrows():
            row_str = row.astype(str).str.lower().tolist()
            if 'id' in row_str or 'cod.' in row_str or '#' in row_str:
                header_idx = i
                break
        
        if header_idx != -1:
            df.columns = df.iloc[header_idx]
            df = df.iloc[header_idx + 1:]
        
        # Select required columns: Id, Ruolo, Nome, Squadra, Qt. A (Current Quotation) or Quotazione
        # Expected mapping to standard CSV for our app:
        # Id, Ruolo, Nome, Squadra, Quotazione
        
        # Normalize columns
        df.columns = df.columns.astype(str).str.strip()
        
        # Map columns
        col_map = {
            'Id': 'id', 'Cod.': 'id', '#': 'id',
            'R': 'role', 'Ruolo': 'role', 'R.': 'role',
            'Nome': 'name', 
            'Squadra': 'team', 'Sq.': 'team', 
            'Qt. A': 'quotation', 'Quotazione': 'quotation', 'Qt.': 'quotation', 'QUOT.': 'quotation'
        }
        
        found_cols = {}
        for col in df.columns:
            if col in col_map:
                found_cols[col_map[col]] = col
        
        if len(found_cols) < 5:
             # Try stricter search if direct map fails or fuzzy matching
             pass

        # Ensure we have the basics
        if 'id' not in found_cols or 'role' not in found_cols or 'name' not in found_cols:
            print("Error: Could not identify required columns (Id, Ruolo, Nome). Found:", df.columns.tolist())
            print("First 5 rows of raw dataframe:")
            print(df.head(10))
            return
            
        # Rename for clarity
        rename_dict = { v: k for k, v in found_cols.items() }
        # Invert found_cols to: { 'Id': 'id', ... }
        # Actually we want: { 'Original': 'Target' }
        final_rename = { val: key for key, val in found_cols.items() }
        
        df = df.rename(columns=final_rename)
        
        # Filter only mapped columns
        # If 'quotation' missing, set to 1
        if 'quotation' not in df.columns:
            df['quotation'] = 1
            
        final_df = df[['id', 'role', 'name', 'team', 'quotation']]
        
        # Save to CSV
        final_df.to_csv(output_path, index=False, header=True)
        print(f"Successfully converted to {output_path}")
        
    except Exception as e:
        print(f"Error converting file: {e}")

if __name__ == "__main__":
    # Default paths
    src_dir = os.path.join(os.getcwd(), 'xlsx')
    out_dir = os.path.join(os.getcwd(), 'csv')
    
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        
    for file in os.listdir(src_dir):
        if file.endswith('.xlsx'):
            in_file = os.path.join(src_dir, file)
            out_file = os.path.join(out_dir, file.replace('.xlsx', '.csv'))
            convert_excel_to_csv(in_file, out_file)
