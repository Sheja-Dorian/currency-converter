# Simple Currency Converter

A minimal currency converter using the free Frankfurter API (no API key needed). This project includes a tiny Node server to serve static files and is ready to be containerized and deployed.

## Features
- Convert between any two currencies (live rates from Frankfurter).
- Swap currencies, save last conversion to localStorage.
- Display 7-day rate history as a chart (Chart.js).

---

## Local build & run

1. Build the container locally (from project root):

```bash
docker build -t <dockerhub-username>/currency-converter:v1 .