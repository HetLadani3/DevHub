from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from config import Config
from models import db, Room, User
from routes.auth import auth_bp, token_required
from routes.review import review_bp
from sockets.room_sockets import register_socket_events
import uuid

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Database
db.init_app(app)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*") 
# Note: we use gevent or eventlet, if standard ws simple-websocket is installed it can work with thread mode too, 
# let's fallback to threading if gevent is not installed or error out. 
# Better yet, allow SocketIO to select the best available async mode automatically by not passing async_mode.
# socketio = SocketIO(app, cors_allowed_origins="*")

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(review_bp, url_prefix='/api/review')

# Register WebSocket Event Handlers
register_socket_events(socketio)

# Create database tables
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return jsonify({"message": "Flask Code Review & Code Room API is running"}), 200

# REST API endpoints for Rooms
@app.route('/api/rooms', methods=['POST'])
@token_required
def create_room(current_user):
    data = request.get_json()
    name = data.get('name', f"{current_user.username}'s Room")
    
    room_id = str(uuid.uuid4())
    new_room = Room(id=room_id, name=name, created_by=current_user.id)
    
    db.session.add(new_room)
    db.session.commit()
    
    return jsonify({
        'roomId': room_id,
        'name': name,
        'createdBy': current_user.username
    }), 201

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)
