# TradeX

A full-stack trading platform project with separate backend, frontend, and dashboard applications.

## Project Structure

```
TradeX/
├── backend/      # Node.js/Express backend API
├── frontend/     # React landing page and static site
├── dashboard/    # React dashboard for trading features
```

---

## Backend

- Built with Node.js and Express
- MongoDB for data storage
- Features:
  - User authentication (JWT)
  - Holdings, Orders, Positions management
  - RESTful API endpoints

### Run Backend

```bash
cd backend
npm install
npm start
```

---

## Frontend

- React-based landing page
- Static content and marketing

### Run Frontend

```bash
cd frontend
npm install
npm start
```

---

## Dashboard

- React-based trading dashboard
- Visualizes holdings, orders, positions, and more

### Run Dashboard

```bash
cd dashboard
npm install
npm start
```

---

## Environment Variables

- Backend requires a `.env` file (not committed to GitHub)
- Example:
  ```
  MONGO_URL=your_mongodb_connection_string
  TOKEN_KEY=your_jwt_secret
  ```

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.
