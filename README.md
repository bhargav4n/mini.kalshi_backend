# Mini Kalshi

A simplified prediction market backend. Users create YES/NO markets, others bet against the creator, and winners are paid when the creator resolves the market.

Tech: Node.js, Express, MongoDB (Mongoose), Zod, bcrypt, JWT. Tested with Postman. No frontend.

How it works -
1. Users sign up and sign in.
2. Users add fake money to their wallet with `/onramp`.
3. A creator opens a market with a side (YES or NO) and an initial wager.
4. Other users can bet only on the opposite side.
5. Total bets cannot exceed the creator's initial wager.
6. The creator resolves the market with `/resolve`.
7. Winners are paid by the 2x rule below.

Payouts -
- Creator wins: `totalBets * 2 + (initialWager - totalBets)`
- Creator loses: each bettor gets `betAmount * 2`, and the creator gets back the unmatched part (`initialWager - totalBets`)

Example - creator stakes 50 on YES, A bets 30 on NO, B bets 10 on NO.
- YES wins: creator 90, A 0, B 0
- NO wins: creator 10, A 60, B 20

Each market settles once, and only its creator can resolve it.

Endpoints (all need a token except signup and signin):

```
POST /signup        { username, password }
POST /signin        { username, password }  -> { token }
POST /onramp        add fake money
POST /market        { title, expiry, side, initialWager }
POST /bet           { marketId, amount }
POST /resolve       { marketId, resolution }  (creator only)
GET  /profile
GET  /transactions
GET  /bets
GET  /markets
```

Collections: `users`, `markets`, `bets`, `walletEvents`

Setup -

```bash
git clone https://github.com/bhargav4n/mini.kalshi_backend.git
cd mini.kalshi_backend
npm install
```

Create a `.env` file in the root -

```
PORT=3000
MONGO_URL=mongodb://127.0.0.1:27017/mini_kalshi
JWT_SECRET=your_secret_key
```

Run the server -

```bash
node src/index.js
```