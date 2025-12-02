from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Data storage
SCORES_FILE = 'scores.json'

def load_scores():
    if os.path.exists(SCORES_FILE):
        with open(SCORES_FILE, 'r') as f:
            return json.load(f)
    return []

def save_scores(scores):
    with open(SCORES_FILE, 'w') as f:
        json.dump(scores, f, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/scores', methods=['GET'])
def get_scores():
    """Get top 10 scores"""
    scores = load_scores()
    scores.sort(key=lambda x: x['score'], reverse=True)
    return jsonify(scores[:10])

@app.route('/api/scores', methods=['POST'])
def submit_score():
    """Submit a new score"""
    data = request.json
    
    score_entry = {
        'player': data.get('player', 'Anonymous'),
        'score': data.get('score', 0),
        'time': data.get('time', 0),
        'lives': data.get('lives', 0),
        'timestamp': datetime.now().isoformat()
    }
    
    scores = load_scores()
    scores.append(score_entry)
    save_scores(scores)
    
    return jsonify({'success': True, 'entry': score_entry})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get game statistics"""
    scores = load_scores()
    
    if not scores:
        return jsonify({
            'total_plays': 0,
            'average_score': 0,
            'best_time': 0,
            'total_players': 0
        })
    
    total_plays = len(scores)
    average_score = sum(s['score'] for s in scores) / total_plays
    best_time = min(s['time'] for s in scores if s['time'] > 0)
    unique_players = len(set(s['player'] for s in scores))
    
    return jsonify({
        'total_plays': total_plays,
        'average_score': round(average_score, 1),
        'best_time': best_time,
        'total_players': unique_players
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
