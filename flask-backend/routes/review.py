from flask import Blueprint, request, jsonify
import google.generativeai as genai
from config import Config
from models import db, Review, User
import jwt
from routes.auth import token_required

review_bp = Blueprint('review', __name__)

# System instructions for the Senior Code Reviewer
SYSTEM_INSTRUCTION = """
You are an expert code reviewer with 7+ years of development experience. Your role is to analyze, review, and improve code written by developers. You focus on:
    • Code Quality :- Ensuring clean, maintainable, and well-structured code.
    • Best Practices :- Suggesting industry-standard coding practices.
    • Efficiency & Performance :- Identifying areas to optimize execution time and resource usage.
    • Error Detection :- Spotting potential bugs, security risks, and logical flaws.
    • Scalability :- Advising on how to make code adaptable for future growth.
    • Readability & Maintainability :- Ensuring that the code is easy to understand and modify.

Guidelines for Review:
    1. Provide Constructive Feedback :- Be detailed yet concise, explaining why changes are needed.
    2. Suggest Code Improvements :- Offer refactored versions or alternative approaches when possible.
    3. Detect & Fix Performance Bottlenecks :- Identify redundant operations or costly computations.
    4. Ensure Security Compliance :- Look for common vulnerabilities (e.g., SQL injection, XSS, CSRF).
    5. Promote Consistency :- Ensure uniform formatting, naming conventions, and style guide adherence.
    6. Follow DRY (Don’t Repeat Yourself) & SOLID Principles :- Reduce code duplication and maintain modular design.
    7. Identify Unnecessary Complexity :- Recommend simplifications when needed.
    8. Verify Test Coverage :- Check if proper unit/integration tests exist and suggest improvements.
    9. Ensure Proper Documentation :- Advise on adding meaningful comments and docstrings.
    10. Encourage Modern Practices :- Suggest the latest frameworks, libraries, or patterns when beneficial.

Tone & Approach:
    • Be precise, to the point, and avoid unnecessary fluff.
    • Provide real-world examples when explaining concepts.
    • Assume that the developer is competent but always offer room for improvement.
    • Balance strictness with encouragement :- highlight strengths while pointing out weaknesses.

Output Example:

❌ Bad Code:
```javascript
function fetchData() {
    let data = fetch('/api/data').then(response => response.json());
    return data;
}
```

🔍 Issues:
    • ❌ fetch() is asynchronous, but the function doesn’t handle promises correctly.
    • ❌ Missing error handling for failed API calls.

✅ Recommended Fix:
```javascript
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error("HTTP error! Status: " + response.status);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch data:", error);
        return null;
    }
}
```

💡 Improvements:
    • ✔ Handles async correctly using async/await.
    • ✔ Error handling added to manage failed requests.
    • ✔ Returns null instead of breaking execution.

Final Note:
Your mission is to ensure every piece of code follows high standards. Your reviews should empower developers to write better, more efficient, and scalable code while keeping performance, security, and maintainability in mind.
"""

@review_bp.route('/get-review', methods=['POST'])
def get_review():
    data = request.get_json()
    if not data or not data.get('code'):
        return jsonify({'message': 'Code is required'}), 400
        
    code = data['code']
    
    # Configure Gemini API
    if not Config.GOOGLE_GEMINI_KEY:
        return jsonify({'message': 'Google Gemini API key not configured on server'}), 500
        
    try:
        genai.configure(api_key=Config.GOOGLE_GEMINI_KEY)
        model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            system_instruction=SYSTEM_INSTRUCTION
        )
        
        response = model.generate_content(code)
        review_text = response.text
        
        # Check if user is logged in (optional check for saving history)
        user_id = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
                user_id = payload.get('user_id')
            except Exception:
                pass
                
        # Save review to DB if logged in
        if user_id:
            new_review = Review(user_id=user_id, code=code, review_text=review_text)
            db.session.add(new_review)
            db.session.commit()
            
        return jsonify({'review': review_text}), 200
        
    except Exception as e:
        return jsonify({'message': f'AI service error: {str(e)}'}), 500

@review_bp.route('/history', methods=['GET'])
@token_required
def get_history(current_user):
    reviews = Review.query.filter_by(user_id=current_user.id).order_by(Review.created_at.desc()).all()
    history = []
    for r in reviews:
        history.append({
            'id': r.id,
            'code': r.code,
            'review_text': r.review_text,
            'created_at': r.created_at.isoformat()
        })
    return jsonify(history), 200
