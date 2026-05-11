# Pacific Scout 2026 - User Guide

Welcome to the official user guide for **Pacific Scout 2026**, the ultimate competition-grade scouting and strategy tool for FRC Team 5025. This guide covers all features of the application, broken down by role and module.

---

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Role-Based Access](#2-role-based-access)
3. [Feature Breakdown](#3-feature-breakdown)
    - [Dashboard](#dashboard)
    - [Match Scouting](#match-scouting)
    - [Pit Scouting](#pit-scouting)
    - [Pit Map](#pit-map)
    - [Team List](#team-list)
    - [Pick Lists](#pick-lists)
    - [Drive Team Hub](#drive-team-hub)
    - [Driver Feedback](#driver-feedback)
    - [Match History](#match-history)
    - [Pit Display](#pit-display)
    - [Match Strategy Predictor](#match-strategy-predictor)
    - [Strategy Whiteboard](#strategy-whiteboard)
    - [Data Export](#data-export)
    - [Customization](#customization)
4. [Admin Controls](#4-admin-controls)

---

## 1. Getting Started

### Authentication
When you first open the app, you will be greeted by the **Sign In** screen. 
- **Sign In**: Enter your registered email and password.
- **Sign Up**: If you are a new user, switch to the sign-up flow to create an account.
*Note: Authentication is powered by Convex. If the backend is disconnected, a warning will appear.*

### Navigation
- **PC/Desktop**: Use the collapsible sidebar on the left. You can click the chevron at the top to collapse it to icons-only mode for more screen space, or click the 5025 logo to expand it.
- **Mobile**: Use the bottom navigation bar. The options visible here depend on your assigned role to keep the interface clean and focused.

---

## 2. Role-Based Access

Pacific Scout uses roles to tailor the experience:
- **Scout**: Focused on data collection. Access to Match Scouting, Pit Scouting, Team List, and Customization.
- **Strategist**: Focused on planning. Access to Drive Team Hub, Match Strategy, Whiteboard, and analytics tools.
- **Admin**: Full access. Can modify event settings, manage data, and access all features listed above.

---

## 3. Feature Breakdown

### Dashboard
The landing page of the application. It provides:
- Quick stats on current scouting progress.
- Links to active matches.
- A summary of the selected event.

### Match Scouting
The core data collection module for matches.
- **How to use**: Select the current match number and the team you are scouting.
- **Data Entry**: Fill out the form as the match progresses (Auto, Teleop, Endgame).
- **Offline Support**: If connection is lost, data is saved locally and synced when you reconnect.

### Pit Scouting
Used to gather data about robots before matches begin.
- **How to use**: Walk around the pits, find teams, and fill out their pit profile (dimensions, drive type, intake style, etc.).
- **Photos**: (If supported) You can attach photos of the robot directly to the profile.

### Pit Map
A visual guide to the event pits.
- Use this to locate teams quickly for pit scouting or strategy discussions.
- Tap a pit location to see which team is assigned there.

### Team List
A searchable directory of all teams at the current event.
- **Search**: Use the search bar at the top or in the page to find a team by number.
- **Details**: Click a team to view their aggregated stats, pit data, and match history.

### Pick Lists
Rank teams for alliance selection.
- **How to use**: Create a new pick list, and drag-and-drop teams to rank them based on your strategy (e.g., "Defense", "First Pick").
- Lists update in real-time across devices for users with access.

### Drive Team Hub
A real-time display designed for the drive team in the pits or queuing area.
- Shows upcoming match schedule.
- Displays alliance partners and opponents with quick stat summaries.
- Alerts for immediate strategy needs.

### Driver Feedback
A quick form for the drive team to fill out immediately after a match.
- **Drivetrain Rating**: Rate the performance on a 1-5 scale.
- **Intake Issues**: Flag if the intake failed or had issues.
- **Notes**: Add general notes about robot performance or match events.

### Match History
A detailed record of Team 5025's matches.
- **Scout Data**: View objective data recorded by scouters (Auto/Teleop scoring, climbs).
- **Driver Feedback**: View subjective data from the drive team (drivetrain feel, intake issues).

### Pit Display
A full-screen Kiosk mode designed for a large monitor in the pit.
- **Active Requests**: Displays active requests from the Drive Team Hub.
- **Last Match**: Shows info about the last match for Team 5025, including driver rating and scouting analysis.
- **Rankings**: Shows current event rankings fetched from The Blue Alliance.

### Match Strategy Predictor
Simulate upcoming matches using real data.
- **Statbotics Integration**: Pulls real-time EPA (Expected Points Added) data.
- **How to use**: Select 3 teams for the Red Alliance and 3 teams for the Blue Alliance.
- **Prediction**: The app calculates projected scores, win probabilities, and component breakdowns (Auto/Teleop) to help you plan counter-strategies.

### Strategy Whiteboard
A high-fidelity tactical planning canvas.
- **Phases**: Independent canvases for **Auto**, **Teleop**, and **Endgame**.
- **Drawing**: Select a color and draw paths, zones, or notes directly on the field image.
- **Robots**: Click "Add Robot" to place a movable token. 
    - **Customize**: Type the team number in the center.
    - **Color**: New robots inherit the color you currently have selected in the toolbar.
    - **Delete**: Click the red "X" on the top right of a robot to remove it.
    - **Movement**: Click and drag the thick border of the robot to move it. The center 6x6 area is reserved for typing to prevent accidental drags.

### Data Export
Export gathered data for external analysis.
- **Sync**: Fetch the latest data from The Blue Alliance (TBA) or Statbotics.
- **Download**: Export scouting data as CSV for use in Excel or Tableau.

### Customization
Tailor the app to your preferences.
- **Theme**: Toggle between Light and Dark modes.
- **Density**: Switch between Compact and Comfortable layouts.
- **UI Tweaks**: Adjust auto-save intervals and toggle haptic feedback.

---

## 4. Admin Controls

### Event Setup
*Visible only to Admins.*
- **Event Selection**: Fetch events from TBA and set the active event for the app.
- **Team Management**: Import team lists and assign pit locations.
- **System Flush**: Clear old data when transitioning to a new event.

---

*Guide version: 1.0.0 (2026)*
*Maintained by FRC Team 5025*
