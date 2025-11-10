# Interactive Web GIS Application

This project is an interactive Web GIS application built with React (Vite), TypeScript, Tailwind CSS, and OpenLayers, developed as part of the LIST LABS Frontend Mid-Level Technical Task.

🚀 Features

OpenLayers Map Initialization with OSM base layer (EPSG:3857)

Map Context for shared OpenLayers map instance across components

Vector Tile Layer (cadastral_parcels) from Tegola service

Feature Interaction: click to highlight parcel, fetch data via API, and display popup

WMS Layer (CORINE Land Cover) with toggle visibility button

Viewport limited to Croatia and initial view centered on Varaždinske Toplice

🛠️ Tech Stack

React (Vite)

TypeScript

Tailwind CSS

OpenLayers

React Query

▶️ Setup & Run
# Install dependencies
npm install

# Run the app (ensure CORS works on localhost:3000)
npm run dev

