# Pacific Scout 2026 - In-Depth User Guide

Welcome to the comprehensive user guide for **Pacific Scout 2026**, the ultimate competition-grade scouting and strategy platform for FRC Team 5025. This guide covers all features of the application, including the mathematical models, formulas, and advanced usage patterns.

---

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Role-Based Access](#2-role-based-access)
3. [Mathematical Models & Formulas](#3-mathematical-models--formulas)
4. [Feature Breakdown](#4-feature-breakdown)
    - [Dashboard & Leaderboard](#dashboard--leaderboard)
    - [Match Scouting & Pit Scouting](#match-scouting--pit-scouting)
    - [Alliance Selection Simulator](#alliance-selection-simulator)
    - [Match Strategy Predictor](#match-strategy-predictor)
    - [Strategy Whiteboard with Frames](#strategy-whiteboard-with-frames)
5. [Advanced Usage](#5-advanced-usage)

---

## 1. Getting Started

### Authentication & Environment
Pacific Scout uses **Convex** for real-time data sync and authentication. 
- **Sign In**: Access is restricted to authorized team members.
- **Auto-Sync**: The app automatically syncs data when online. If connection is lost (common in high-interference arenas), data is cached in `localStorage` and pushed when reconnected.

---

## 2. Role-Based Access

The application tailors the interface based on your assigned role:
- **Scout**: Access to Match/Pit Scouting and the Leaderboard.
- **Strategist**: Access to Match Strategy, Alliance Simulator, and Whiteboard.
- **Admin**: Full access, including event setup and data management.

---

## 3. Mathematical Models & Formulas

Pacific Scout combines real-time scouting data with external models like **Statbotics** to provide predictive insights.

### 3.1 Expected Points Added (EPA)
We pull EPA data from Statbotics. EPA is a measure of a team's contribution to the alliance score.

#### Formula: Alliance Projected Score
The projected score for an alliance is the sum of the EPAs of the three teams on that alliance.
$$ \text{Projected Score} = \sum_{i=1}^{3} \text{EPA}_{\text{team}_i} $$

#### Formula: Win Probability
Statbotics calculates win probability using a normal distribution based on the difference in EPA between the two alliances.
$$ P(\text{Red Win}) = \Phi\left(\frac{\text{EPA}_{\text{Red}} - \text{EPA}_{\text{Blue}}}{\sigma}\right) $$
*Where $\Phi$ is the Cumulative Distribution Function of the standard normal distribution, and $\sigma$ is the historical standard deviation of match scores (typically around 15-20 points).*

### 3.2 Statbotics vs Reality (Performance Delta)
To identify teams that are under- or over-performing their Statbotics projection, we calculate the **Performance Delta**.

#### Formula:
$$ \Delta = \text{Scouter Average Score} - \text{Statbotics EPA} $$
- **Positive $\Delta$**: The team is performing *better* than expected. Great pick for alliance selection!
- **Negative $\Delta$**: The team is underperforming. Possible mechanical issues or difficult schedule.

### 3.3 Scouter Leaderboard Scoring
To encourage active participation, scouters earn points based on their activity.

#### Formula:
$$ \text{Total Points} = (M \times 10) + (P \times 5) $$
- $M$: Number of matches scouted.
- $P$: Number of pits scouted.

---

## 4. Feature Breakdown

### Dashboard & Leaderboard
The landing page provides quick stats and the **Scouter Leaderboard**.
- **Leaderboard**: Displays scouters ranked by their total points (see formula above).
- **HUD Mode**: Click the full-screen icon to enter a dark-themed, high-contrast HUD mode designed for dark pits or projector displays.

### Match Scouting & Pit Scouting
The core data collection modules.
- **Match Scouting**: Records specific actions during a match (Auto pieces, Teleop pieces, Endgame state).
- **Pit Scouting**: Records robot dimensions, drivetrain types, and capabilities.

### Alliance Selection Simulator
A tool to practice and simulate the FRC alliance selection process.
- **Serpentine Draft**: The simulator follows the standard FRC draft order:
    - **Round 1**: Seed 1 $\rightarrow$ Seed 8
    - **Round 2**: Seed 8 $\rightarrow$ Seed 1
- **Picking Captains**: If a top 8 team (captain) is picked by another captain:
    1. The picked team joins the alliance.
    2. All captains below them shift up one spot.
    3. The next highest-ranked available team becomes the new Seed 8.
- **Projected EPA**: The simulator updates the projected EPA of each alliance in real-time as picks are made.

### Match Strategy Predictor
Compare any 6 teams to see a simulated match.
- **Input**: Select 3 Red teams and 3 Blue teams.
- **Output**: Breakdown of predicted scores and comparison with actual scouting averages if available.

### Strategy Whiteboard with Frames
A multi-step tactical planning tool.
- **Frames**: You can save snapshots of the board.
- **How it works**: When you save a frame, the app saves:
    1. The HTML5 Canvas drawing as a Base64 Data URL.
    2. The XY coordinates of all robot tokens.
    3. The text notes associated with the phase.
- This allows you to flip between "Frame 1 (Auto)", "Frame 2 (Teleop)", and "Frame 3 (Endgame)" during strategy briefings.

---

## 5. Advanced Usage

### Data Export for Tableau/Excel
Admins can export the scouting database as a CSV.
- The CSV contains raw counts for all actions.
- Recommended Formula for custom ranking in Excel:
  $$ \text{Custom Rank} = (\text{Avg Auto} \times 4) + (\text{Avg Teleop} \times 2) + (\text{Climb \%} \times 10) $$

---
*Guide version: 1.1.0 (2026)*  
*Maintained by FRC Team 5025*
