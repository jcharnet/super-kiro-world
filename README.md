# 🎮 Super Kiro World - re:Invent Edition

A browser-based platformer game themed around Kiro debugging cloud systems at AWS re:Invent. Features innovative Time Warp mechanics, persistent score tracking, and rich particle effects.

![Kiro Logo](static/kiro-logo.png)

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Running

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Install JavaScript dependencies (for testing):**
```bash
npm install
```

3. **Run the Flask server:**
```bash
python app.py
```

4. **Open your browser to:**
```
http://localhost:5001
```

### Running Tests

```bash
npm test
```

## 🎯 Game Objective

Navigate through cloud infrastructure platforms, collect metrics, and reach the Deploy Gate while managing your lives and Time Warp abilities!

## 🕹️ Controls

| Key | Action |
|-----|--------|
| **Arrow Keys / WASD** | Move left/right |
| **Space / Up Arrow / W** | Jump |
| **E** | Time Warp (rewind 2.5 seconds) |
| **R** | Restart (on game over or level complete) |
| **Any Key** | Skip splash screen |

## ✨ Features

### 🎬 Cinematic Experience
- **Splash Screen**: Animated "Booting the Cloud" sequence with console logs
- **Smooth Animations**: 60 FPS gameplay with parallax scrolling
- **Screen Effects**: Dynamic screen shake and particle systems

### 🎮 Core Gameplay
- **Platforming Physics**: Smooth movement with gravity, friction, and collision detection
- **Time Warp Mechanic**: Rewind 2.5 seconds of gameplay (3 uses per level)
- **Lives System**: 3 lives with respawn at checkpoints
- **Collectibles**: Gather metrics throughout the level
- **Deploy Gate**: Reach the goal to complete the level

### 💾 Score Persistence
- **Local Storage**: Automatic game history tracking
- **Personal High Scores**: Track your best performance
- **Server Leaderboard**: Global top 10 scores
- **Game Statistics**: Total plays, average scores, and more

### 🎨 Visual Effects
- **Trail Particles**: Dynamic particles follow Kiro's movement
- **Collision Effects**: Explosion particles on platform impacts
- **Sparkle Effects**: Celebratory particles when collecting items
- **Confetti**: Special effects for new high score achievements

### 🔧 Technical Features
- **Property-Based Testing**: Comprehensive test coverage with fast-check
- **Error Handling**: Graceful degradation for storage quota issues
- **Responsive Design**: Smooth camera following with lerp
- **Kiro Branding**: Purple (#790ECB) color scheme throughout

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/scores` | Retrieve top 10 scores |
| `POST` | `/api/scores` | Submit new score (JSON: player, score, time, lives) |
| `GET` | `/api/stats` | Get game statistics |

## 📁 Project Structure

```
game-application/
├── .kiro/                      # Project documentation & specs
│   ├── specs/                 # Feature specifications
│   │   ├── score-and-effects/ # Score persistence & particle effects
│   │   ├── game-feel-polish/  # Polish and feel improvements
│   │   ├── level-2/           # Second level design
│   │   ├── new-obstacles/     # Additional obstacles
│   │   ├── power-ups/         # Power-up system
│   │   └── audio-system/      # Audio implementation
│   └── steering/              # Development guidelines
│       ├── tech.md           # Tech stack documentation
│       ├── structure.md      # Code organization
│       ├── product.md        # Product overview
│       └── game-style-guide.md
├── static/
│   ├── game.js               # Main game logic & rendering
│   ├── splash.js             # Splash screen animation
│   └── kiro-logo.png         # Character sprite (40x40)
├── templates/
│   └── index.html            # Game canvas & UI
├── tests/
│   └── scoreManager.test.js  # Property-based tests
├── app.py                    # Flask backend server
├── requirements.txt          # Python dependencies
├── package.json              # Node.js dependencies
└── scores.json               # Score storage (auto-generated)
```

## 🧪 Testing

The project uses property-based testing with [fast-check](https://github.com/dubzzz/fast-check) to ensure correctness:

- **Property 1**: Game session storage completeness
- **Property 2**: Game history preservation
- **Property 3**: Player name association
- **Property 4**: High score calculation accuracy
- **Property 7**: High score persistence round-trip

Each test runs 100 iterations with randomly generated inputs to verify system properties.

## 🎨 Game Physics

- **Gravity**: 0.5
- **Jump Power**: 12
- **Move Speed**: 5
- **Friction**: 0.85
- **Camera Lerp**: 0.1 (smooth following)
- **Canvas Size**: 800x600 pixels
- **Level Width**: 4000 pixels (scrolling)

## 🛠️ Tech Stack

### Frontend
- HTML5 Canvas with 2D context
- Vanilla JavaScript (ES6+)
- 60 FPS game loop with requestAnimationFrame

### Backend
- Flask 3.0.0 (Python web framework)
- flask-cors 4.0.0 for cross-origin requests
- JSON file-based persistence

### Testing
- Node.js test runner
- fast-check for property-based testing

## 📝 Development

This game was built using spec-driven development with Kiro. Each feature has:
- **Requirements**: User stories and acceptance criteria (EARS format)
- **Design**: Architecture, components, and correctness properties
- **Tasks**: Implementation plan with property-based tests

See `.kiro/specs/` for detailed feature documentation.

## 🎓 Workshop Context

Built for AWS re:Invent workshop participants learning game development. The game demonstrates:
- Canvas-based rendering
- Game physics and collision detection
- State management
- API integration
- Local storage persistence
- Property-based testing

## 📄 License

MIT License - Feel free to use this for learning and workshops!

## 🙏 Acknowledgments

- Built with [Kiro](https://kiro.dev) - AI-powered development assistant
- Created for AWS re:Invent 2024
- Kiro branding and assets from Kiro.dev
