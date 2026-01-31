# FantaCalcio PWA ⚽️

Manage your Fantacalcio team with this modern, mobile-first Progressive Web App (PWA).

## 📱 Features

*   **PWA Ready**: Installable on iOS (Add to Home Screen) and Android.
*   **Team Management**: Set your lineup (3-4-3, 4-3-3, etc.), manage bench, and view player prices/stats.
*   **Live Results**: View match results with calculated fantasy scores (Win/Draw/Loss badges).
*   **Standings**: Stylish, interactive league table with podium visualization.
*   **Transfer Market**:
    *   **Auction System**: Create and bid on players (24h auctions).
    *   **Trades**: Propose and accept trades with other users (Players + Credits).
    *   **Free Agents**: Sign available players.
*   **Matchday Reminder**: Countdown to lineup lock and Next Matchday info.
*   **Admin Panel**: Manage market, auctions, and score calculation.
*   **Dark Mode**: Fully supported system-wide dark mode.
*   **Multi-language**: Italian 🇮🇹 and English 🇬🇧 support.

## 🛠 Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Animations**: Framer Motion & Tailwind Animate

## 🚀 Getting Started

1.  **Clone the repo**
    ```bash
    git clone https://github.com/prencipemarco/pwa-fantacalcio.git
    cd pwa-fantacalcio
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create `.env.local` with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    FOOTBALL_DATA_API_KEY=your_football_data_api_key (Optional)
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

5.  **Build for Production**
    ```bash
    npm run build
    npm start
    ```

## 📂 Project Structure

See `PROJECT_DOCUMENTATION.md` for a deep dive into the code architecture.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License test.
