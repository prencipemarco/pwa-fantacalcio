import pandas as pd
import os

# Paths
INPUT_XLSX = '/Volumes/Crucial X6/workspace/web/pwa-fantacalcio/scripts/xlsx/listone/lista_calciatori_lista calciatori_classic_francescodibbar.xlsx'
OUTPUT_ROSTERS = '/Volumes/Crucial X6/workspace/web/pwa-fantacalcio/scripts/csv/squadre/roosters.csv'
OUTPUT_SVINCOLATI = '/Volumes/Crucial X6/workspace/web/pwa-fantacalcio/scripts/csv/listone/svincolati.csv'

def process_data():
    if not os.path.exists(INPUT_XLSX):
        print(f"Error: Input file not found at {INPUT_XLSX}")
        return

    print("Reading Excel file...")
    df = pd.read_excel(INPUT_XLSX)
    
    # Clean column names
    df.columns = [str(c).lower().strip() for c in df.columns]
    print("Columns found:", df.columns.tolist())

    # Map columns based on observed names
    # Found: ['#', 'nome', 'fuori lista', 'sq.', 'under', 'r.', 'r.mantra', 'pgv', 'mv', 'fm', 'fvm/1000', 'quot.', 'fantasquadra', 'costo']
    
    col_id = '#' 
    col_role = 'r.'
    col_name = 'nome'
    col_team = 'sq.' # Real Team
    col_fanta = 'fantasquadra'
    col_purchase_price = 'costo'
    col_quotation = 'quot.'

    print(f"Mapping: ID={col_id}, Role={col_role}, Name={col_name}, RealTeam={col_team}, FantaTeam={col_fanta}, Purchase={col_purchase_price}, Quot={col_quotation}")

    rosters = []
    svincolati = []
    teams_found = set()
    abroad_players = []

    for index, row in df.iterrows():
        # Helpers
        try:
            fanta_team = str(row[col_fanta]).strip()
            if fanta_team.lower() in ['nan', 'none', '', '-', 'svincolato']:
                fanta_team = ""
        except:
            fanta_team = ""

        name = str(row[col_name]).strip()
        if '*' in name:
            abroad_players.append(name)

        # ID
        p_id = row[col_id]

        # Role
        role = str(row[col_role]).strip().upper()

        # Real Team
        real_team = str(row[col_team]).strip()

        # Prices
        # Purchase Price (Costo)
        try:
            purchase_price = int(row[col_purchase_price])
        except:
            purchase_price = 1 # Default if missing
        
        # Quotation (Quot.)
        try:
            quotation = int(row[col_quotation])
        except:
            quotation = 1

        is_owned = False
        is_owned = False
        if fanta_team:
            is_owned = True
            teams_found.add(fanta_team)
            # Rosters: Team Name;Player Name;Price
            # Use Purchase Price here
            rosters.append({
                'Team Name': fanta_team,
                'Player Name': name,
                'Price': purchase_price
            })
        
        # ALWAYS add to Svincolati (Master List)
        svincolati.append({
            'id': p_id,
            'role': role,
            'name': name,
            'team': real_team,
            'quotation': quotation
        })

    # Save Rosters (DISABLED to protect manual edits)
    # print(f"Saving {len(rosters)} players to rosters...")
    # df_rosters = pd.DataFrame(rosters)
    # if not df_rosters.empty:
    #     df_rosters = df_rosters[['Team Name', 'Player Name', 'Price']]
    #     # Sort by Team Name then Player Name
    #     df_rosters.sort_values(by=['Team Name', 'Player Name'], inplace=True)
    #     df_rosters.to_csv(OUTPUT_ROSTERS, sep=';', index=False)
    # else:
    #     print("Warning: No roster players found!")

    # Save Svincolati
    print(f"Saving {len(svincolati)} players to svincolati (Complete List)...")
    df_svincolati = pd.DataFrame(svincolati)
    if not df_svincolati.empty:
        df_svincolati = df_svincolati[['id', 'role', 'name', 'team', 'quotation']]
        df_svincolati.sort_values(by=['role', 'name'], inplace=True)
        df_svincolati.to_csv(OUTPUT_SVINCOLATI, sep=',', index=False)
    else:
        print("Warning: No free agents found!")

    print("\nFanta Teams Found:")
    for t in sorted(list(teams_found)):
        print(f"- {t}")
        
    print(f"\nPlayers abroad (*): {len(abroad_players)}")

if __name__ == "__main__":
    process_data()
