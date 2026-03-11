# Pantau Pendidikan

Pantau Pendidikan is a modern web application designed to monitor and analyze the education landscape in Indonesia. It provides an AI-powered interface to query educational data and explore various data sources.

## 🚀 Key Features

-   **AI-Powered Insights**: Get answers to your questions about Indonesian education using an integrated AI query system.
-   **Data Source Exploration**: Browse through a curated set of data sources related to education.
-   **Multi-language Support**: Seamlessly switch between Indonesian and English.
-   **Modern UI/UX**: Fast, responsive interface with Dark Mode support by default.
-   **Interactive Visualizations**: (Planned/Current) View educational metrics through interactive charts.

## 🛠 Tech Stack

-   **Frontend**: React 18, Vite
-   **Styling**: Vanilla CSS, CSS Modules
-   **Architecture**: Component-based architecture with separated styles.

## 📂 Project Structure

```text
pantau-pendidikan/
├── src/
│   ├── components/   # Reusable UI components
│   ├── data/         # Static data and strings (L10n)
│   ├── pages/        # Main application pages (Home, Data Sources)
│   ├── styles/       # Global styles and CSS variables
│   ├── utils/        # Utility functions (AI integration, etc.)
│   ├── App.jsx       # Root component and routing
│   └── main.jsx      # Entry point
├── public/           # Static assets
├── index.html        # HTML template
├── vite.config.js    # Vite configuration
└── package.json      # Dependencies and scripts
```

## 🚥 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   npm (comes with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone [repository-url]
    cd pantau-pendidikan
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

1.  Start the development server:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:5173`.

### Building for Production

To create a production build:
```bash
npm run build
```
The optimized files will be generated in the `dist` directory.

---

*Part of the Indonesian Education Monitoring Initiative.*
