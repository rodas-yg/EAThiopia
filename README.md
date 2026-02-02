# EAThiopia: AI-Powered Nutrition & Wellness Tracker

> A full-stack intelligent nutrition application designed to bridge the gap between cultural cuisine and modern health analytics.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📖 Overview

**EAThiopia** is a comprehensive health platform built to track calories, macros, and weight progress with a specific focus on inclusivity for Ethiopian cuisine. Unlike standard trackers that often miss cultural foods, EAThiopia integrates a custom database with external APIs to provide accurate tracking for *Injera*, *Doro Wat*, and global foods alike.

The system leverages **Google Gemini AI** for on-the-fly recipe generation and **Scikit-Learn** for predictive weight loss modeling, offering users a data-driven path to their health goals.

---

## Key Features

### Artificial Intelligence & Machine Learning
* **Generative AI (Google Gemini):** When external databases (like USDA) provide nutrition data but lack cooking instructions, the app dynamically generates detailed recipes, ingredients, and cooking times using Large Language Models (LLM).
* **Predictive Weight Analytics (Scikit-Learn):** A custom **Linear Regression model** analyzes user weight logs over time to calculate the user's daily rate of change. It provides a real-time forecasted date for when the user will reach their goal weight, adapting automatically to fluctuations in progress.

### 📊 Backend & Data Engineering
* **Robust API Integration:** Aggregates data from multiple sources including **USDA FoodData Central** and **Spoonacular** to ensure a vast library of food items.
* **Smart Caching:** Implements local caching strategies to reduce API calls and improve latency for frequently accessed foods.
* **Secure Authentication:** Google OAuth 2.0 integration for seamless and secure user sign-in.
* **Dynamic Calorie Recalculation:** Automatically adjusts daily calorie targets (TDEE) based on the Mifflin-St Jeor equation whenever a user updates their weight log.

### 💻 Frontend Experience
* **Interactive Dashboard:** Built with **React, TypeScript, and Tailwind CSS** for a responsive, modern UI.
* **Data Visualization:** Real-time progress bars and statistical cards to track Protein, Carbs, and Fats.
* **Cultural Design:** Custom UI patterns (Tibeb) reflecting Ethiopian heritage.

---

##  Tech Stack

### Backend
* **Language:** Python 3
* **Framework:** Flask (RESTful API)
* **Database:** PostgreSQL (via SQLAlchemy ORM)
* **ML & Data:** Scikit-Learn, Pandas, NumPy
* **AI:** Google Gemini Pro / Flash 1.5
* **Auth:** Google OAuth2

### Frontend
* **Library:** React.js (Vite)
* **Language:** TypeScript
* **Styling:** Tailwind CSS, Shadcn/UI
* **State Management:** React Hooks

---

## Installation & Setup

### Prerequisites
* Node.js & npm
* Python 3.x
* PostgreSQL (or SQLite for local testing)

### 1. Backend Setup
```bash
# Clone the repository
git clone [https://github.com/yourusername/eathiopia.git](https://github.com/yourusername/eathiopia.git)
cd eathiopia/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# (Create a .env file with the keys listed below)

# Run the server
python app.py


