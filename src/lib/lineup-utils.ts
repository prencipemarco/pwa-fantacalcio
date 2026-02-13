
export const MODULES = ['3-4-3', '3-5-2', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];

export const getFormationCoords = (module: string) => {
    const [def, mid, fwd] = module.split('-').map(Number);
    const coords: { role: string; x: number; y: number }[] = [];
    // GK
    coords.push({ role: 'P', x: 50, y: 90 });
    // Defenders
    for (let i = 0; i < def; i++) coords.push({ role: 'D', x: (100 / (def + 1)) * (i + 1), y: 70 });
    // Midfielders
    for (let i = 0; i < mid; i++) coords.push({ role: 'C', x: (100 / (mid + 1)) * (i + 1), y: 45 });
    // Forwards
    for (let i = 0; i < fwd; i++) coords.push({ role: 'A', x: (100 / (fwd + 1)) * (i + 1), y: 15 });
    return coords;
};

export const getRoleColor = (role: string) => {
    switch (role) {
        case 'P': return 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-800';
        case 'D': return 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-800';
        case 'C': return 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-800';
        case 'A': return 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-900/30 dark:text-rose-100 dark:border-rose-800';
        default: return 'bg-muted text-muted-foreground';
    }
};
