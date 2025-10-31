# Full-Stack Calorie Tracker

A complete, self-contained calorie and macronutrient tracking application built with a Java Spring Boot backend and a vanilla JavaScript frontend.



This project was built from scratch to demonstrate full-stack development skills. It features a complete REST API backend that serves a dynamic, single-page JavaScript application. All food data is provided by a self-contained JSON file, making the project 100% reliable and free of external API keys.

### Live Demo

**(Paste your live Render.com URL here once hosting is complete)**

### Key Features

* **Full CRUD Functionality:** Create, Read, Update, and Delete food log entries and custom user-created foods.
* **Local Food Database:** Instantly search a local `foods-database.json` file containing 50+ common foods.
* **Dynamic Serving Sizes:** Adjust the serving size of any food to see real-time updates to calories and macros.
* **Daily Diary & Totals:** Log foods to your daily diary and see your totals update instantly.
* **Macro Tracking:** Visual progress bars for Protein, Carbs, and Fat against your daily goals.
* **"My Foods" List:** Save your own custom foods and meals for quick, repeated logging.
* **TDEE Calculator:** A built-in calculator to help users estimate their daily maintenance calories.

### Tech Stack

* **Backend:** Java, Spring Boot, Spring Data JPA
* **Database:** H2 (In-Memory)
* **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript (ES6+), Chart.js

### How to Run Locally

1.  Clone this repository.
2.  The project is self-contained and requires no API keys.
3.  Run the `CalorieTrackerApplication.java` file from your IDE (like IntelliJ).
4.  Open `http://localhost:8080` in your browser.
