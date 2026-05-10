# ⚡ Pacific Scout 2026

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Tech Stack](https://img.shields.io/badge/tech-Vite%20%7C%20React%20%7C%20Convex-blueviolet)

**Pacific Scout** is a high-performance, next-generation scouting and strategy platform designed for FIRST Robotics Competition (FRC) teams. Built to operate flawlessly in the chaotic environment of competition events, the system provides real-time data ingestion, deep analytics, and actionable match strategy insights.

---

## 🚀 Key Features

*   **Match & Pit Scouting:** Mobile-optimized, rapid-entry forms for scouting robots on the field and in the pits.
*   **Tactical Drive Team Hub:** Real-time dashboards allowing drive coaches to analyze alliance compositions and formulate winning strategies.
*   **Match Predictor Simulator:** Drag-and-drop alliance builder that aggregates scouting data to project scores and compare strengths.
*   **Offline Resilience:** Designed with competition Wi-Fi in mind, featuring local caching and automatic data syncing when connection is restored.
*   **Data Export & Analytics Center:** Seamless integration with external analysis tools (Tableau, PowerBI) via CSV exports, plus integration hooks for The Blue Alliance (TBA) and Statbotics.
*   **Interactive Pit Map:** Visual map representation of the pit area for quick scouting navigation.
*   **Role-Based Access Control:** Secure, robust authentication ensuring only authorized users can modify event setups and system configurations.

## 🛠️ Technology Stack

*   **Frontend Framework:** React 19 + Vite
*   **Routing:** React Router 7 (Single Page Application)
*   **Styling:** Tailwind CSS v4 + shadcn/ui
*   **Backend & Database:** Convex (Serverless Backend, WebSockets, Real-time Sync)
*   **State Management:** Zustand
*   **Authentication:** Convex Auth (Role-based access)
*   **Icons:** Lucide React
*   **Hosting & Analytics:** Vercel

## 📦 Getting Started

### Prerequisites
*   Node.js (v18+) or Bun
*   A Convex account for backend provisioning

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/Pacific-Steel-Scouting.git
   cd Pacific-Steel-Scouting
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up the backend:**
   Follow the prompts to initialize your Convex dev environment:
   ```bash
   bunx convex dev
   ```

4. **Start the development server:**
   ```bash
   bun run dev
   ```
   *The app will run locally at `http://localhost:5173`.*

## 🔒 Security & Roles

Pacific Scout uses a strict Role-Based Access Control (RBAC) system. The `Admin` role is required for accessing the **Event Setup** tab and modifying underlying event keys. All other scouters operate on minimum-privilege access to ensure data integrity.

## 🤝 Contributing

We welcome contributions from mentors and students alike! Please check the issues tab for active tasks or submit a PR with new feature proposals.

---
*Built with precision for FRC Team 5025 - Pacific Steel.*
