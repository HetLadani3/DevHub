from flask_socketio import emit, join_room, leave_room
from flask import request, current_app
import jwt
from config import Config
from models import User, Room, db

# active_rooms dictionary:
# {
#    room_id: {
#        sid: { 'username': username, 'userId': user_id }
#    }
# }
active_rooms = {}

def register_socket_events(socketio):
    
    def get_user_from_token(token):
        if not token:
            return None
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            user = User.query.get(payload['user_id'])
            if user:
                return {'id': user.id, 'username': user.username}
        except Exception:
            pass
        return None

    @socketio.on('connect')
    def handle_connect():
        print(f"Client connected: {request.sid}")

    @socketio.on('disconnect')
    def handle_disconnect():
        sid = request.sid
        print(f"Client disconnected: {sid}")
        # Remove user from any room they were in
        for room_id, users in list(active_rooms.items()):
            if sid in users:
                user_info = users.pop(sid)
                print(f"Removing user {user_info['username']} from room {room_id}")
                
                # Check if host left
                is_host = False
                try:
                    from app import app
                    with app.app_context():
                        room = Room.query.get(room_id)
                        if room and room.created_by == user_info['userId']:
                            is_host = True
                            db.session.delete(room)
                            db.session.commit()
                except Exception as e:
                    print(f"Error checking host: {e}")

                if is_host:
                    emit('room-closed', {'message': 'Host has ended the meeting.'}, to=room_id)
                    active_rooms.pop(room_id, None)
                    break
                
                # Notify others in the room
                emit('user-left', {
                    'sid': sid,
                    'username': user_info['username'],
                    'users': list(users.values())
                }, to=room_id)
                
                # If room is empty, delete it
                if not users:
                    active_rooms.pop(room_id)
                break

    @socketio.on('join-room')
    def handle_join_room(data):
        room_id = data.get('roomId')
        token = data.get('token')
        
        user_info = get_user_from_token(token)
        if not user_info:
            emit('error', {'message': 'Authentication failed. Please log in.'})
            return
            
        # Validate that the room exists in the database
        room = Room.query.filter_by(id=room_id).first()
        if not room:
            emit('error', {'message': 'Room not found. Please check the Meeting ID.'})
            return
            
        sid = request.sid
        join_room(room_id)
        
        # Add to active rooms tracking
        if room_id not in active_rooms:
            active_rooms[room_id] = {}
            
        # Clean up any existing duplicate socket sessions for this user in the room
        is_reconnect = False
        duplicate_sids = [old_sid for old_sid, info in active_rooms[room_id].items() if info['userId'] == user_info['id']]
        for old_sid in duplicate_sids:
            is_reconnect = True
            print(f"Removing duplicate connection for user {user_info['username']} (old sid: {old_sid})")
            active_rooms[room_id].pop(old_sid, None)
            
        active_rooms[room_id][sid] = {
            'username': user_info['username'],
            'userId': user_info['id'],
            'sid': sid
        }
        
        print(f"User {user_info['username']} joined room {room_id}")
        
        # Send room state to the user who just joined
        # (could request current code from host later, for now client handles code initialization)
        emit('room-joined', {
            'users': list(active_rooms[room_id].values())
        })
        
        if not is_reconnect:
            # Broadcast to other users in the room that a new user joined
            emit('user-joined', {
                'username': user_info['username'],
                'userId': user_info['id'],
                'sid': sid,
                'users': list(active_rooms[room_id].values())
            }, to=room_id, include_self=False)
        else:
            # Just update the user list silently
            emit('user-updated', {
                'users': list(active_rooms[room_id].values())
            }, to=room_id, include_self=False)

    @socketio.on('leave-room')
    def handle_leave_room(data):
        room_id = data.get('roomId')
        sid = request.sid
        leave_room(room_id)
        
        if room_id in active_rooms and sid in active_rooms[room_id]:
            user_info = active_rooms[room_id].pop(sid)
            print(f"User {user_info['username']} left room {room_id}")
            
            # Check if host left
            is_host = False
            try:
                from app import app
                with app.app_context():
                    room = Room.query.get(room_id)
                    if room and room.created_by == user_info['userId']:
                        is_host = True
                        db.session.delete(room)
                        db.session.commit()
            except Exception as e:
                print(f"Error checking host: {e}")

            if is_host:
                emit('room-closed', {'message': 'Host has ended the meeting.'}, to=room_id)
                active_rooms.pop(room_id, None)
                return
            
            emit('user-left', {
                'sid': sid,
                'username': user_info['username'],
                'users': list(active_rooms[room_id].values())
            }, to=room_id)
            
            if not active_rooms[room_id]:
                active_rooms.pop(room_id)

    @socketio.on('code-change')
    def handle_code_change(data):
        room_id = data.get('roomId')
        code = data.get('code')
        # Broadcast code changes to all other clients in the same room
        emit('code-update', {'code': code}, to=room_id, include_self=False)

    @socketio.on('cursor-change')
    def handle_cursor_change(data):
        room_id = data.get('roomId')
        cursor = data.get('cursor') # e.g. { line: X, ch: Y }
        sid = request.sid
        if room_id in active_rooms and sid in active_rooms[room_id]:
            username = active_rooms[room_id][sid]['username']
            emit('cursor-update', {
                'sid': sid,
                'username': username,
                'cursor': cursor
            }, to=room_id, include_self=False)

    @socketio.on('send-message')
    def handle_send_message(data):
        room_id = data.get('roomId')
        message = data.get('message')
        sid = request.sid
        if room_id in active_rooms and sid in active_rooms[room_id]:
            username = active_rooms[room_id][sid]['username']
            emit('new-message', {
                'username': username,
                'message': message,
                'timestamp': data.get('timestamp')
            }, to=room_id)
