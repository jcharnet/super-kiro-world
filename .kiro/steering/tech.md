---
inclusion: always
---

# Tech Stack

## Backend
- **Framework**: Flask 3.0.0 (Python web framework)
- **CORS**: flask-cors 4.0.0 for cross-origin requests
- **Data Storage**: JSON file-based persistence (scores.json)
- **Server**: Development server runs on port 5001

## Frontend
- **Rendering**: HTML5 Canvas with 2D context
- **Game Logic**: Vanilla JavaScript (ES6+)
- **Canvas Size**: 800x600 pixels
- **Level Width**: 4000 pixels (scrolling)
- **Target FPS**: 60 (using requestAnimationFrame)

## Dependencies
```
Flask==3.0.0
flask-cors==4.0.0
```

## Common Commands

### Setup
```bash
pip install -r requirements.txt
```

### Run Development Server
```bash
python app.py
```
Server runs on `http://localhost:5001`

### Access Game
Open browser to `http://localhost:5001`

## API Endpoints

- `GET /api/scores` - Retrieve top 10 scores
- `POST /api/scores` - Submit new score (JSON body: player, score, time, lives)
- `GET /api/stats` - Get game statistics (total plays, average score, best time, unique players)

## Game Physics Constants

- Gravity: 0.5
- Jump Power: 12
- Move Speed: 5
- Friction: 0.85
- Max Time Warps: 3 per level
- Time Warp History: 2.5 seconds
- Camera Lerp: 0.1 (smooth following)

## Asset Requirements

- Character sprite: `/static/kiro-logo.png` (40x40 pixels recommended)
- All other visuals are procedurally generated via Canvas API
