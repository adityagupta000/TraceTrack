from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta
import os
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)

app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False 

app.secret_key = "your_secret_key"
bcrypt = Bcrypt(app)

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Mysql@123",
        database="lost_and_founds"
    )

# Enable CORS on your Flask app
CORS(app, supports_credentials=True)

# Authentication decorator
def login_required(f):
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def admin_required(f):
    def decorated_function(*args, **kwargs):
        if "user_id" not in session or session.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# API Routes
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if user and bcrypt.check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            session["name"] = user["name"]
            session["role"] = user["role"]
            session["email"] = user["email"]
            return jsonify({
                "success": True,
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"]
                }
            })
        else:
            return jsonify({"success": False, "error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"success": False, "error": "Database error"}), 500
    finally:
        conn.close()

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    if not all([name, email, password, confirm_password]):
        return jsonify({"success": False, "error": "All fields are required"}), 400

    if password != confirm_password:
        return jsonify({"success": False, "error": "Passwords do not match"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
                       (name, email, hashed_password, "user"))
        conn.commit()
        return jsonify({"success": True, "message": "Registration successful"})
    except mysql.connector.Error as err:
        if err.errno == 1062:  # Duplicate entry
            return jsonify({"success": False, "error": "Email already registered"}), 409
        return jsonify({"success": False, "error": "Database error"}), 500
    finally:
        conn.close()

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})

@app.route("/api/user", methods=["GET"])
@login_required
def get_user():
    return jsonify({
        "id": session["user_id"],
        "name": session["name"],
        "email": session["email"],
        "role": session["role"]
    })

@app.route("/api/dashboard", methods=["GET"])
@login_required
def dashboard():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get user's items
        cursor.execute("SELECT * FROM items WHERE created_by = %s ORDER BY created_at DESC", (session["user_id"],))
        user_items = cursor.fetchall()

        # Get user's claims
        cursor.execute("""
            SELECT claims.*, items.name as item_name, items.description, items.location 
            FROM claims 
            JOIN items ON claims.item_id = items.id 
            WHERE claims.claimed_by = %s
            ORDER BY claims.claimed_at DESC
        """, (session["user_id"],))
        user_claims = cursor.fetchall()

        # Get user's messages
        cursor.execute("""
            SELECT messages.*, users.name as sender_name, items.name as item_name 
            FROM messages 
            JOIN users ON messages.sender_id = users.id 
            JOIN items ON messages.item_id = items.id 
            WHERE messages.receiver_id = %s 
            ORDER BY sent_at DESC
        """, (session["user_id"],))
        messages = cursor.fetchall()

        return jsonify({
            "user": {
                "name": session["name"],
                "email": session["email"],
                "role": session["role"]
            },
            "items": user_items,
            "claims": user_claims,
            "messages": messages
        })
    except Exception as e:
        return jsonify({"error": "Database error"}), 500
    finally:
        conn.close()

@app.route("/api/items", methods=["GET"])
@login_required
def get_items():
    search_query = request.args.get("search", "")
    status_filter = request.args.get("status", "")
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Building the SQL query
        query = """
            SELECT items.*, users.name AS creator_name 
            FROM items
            LEFT JOIN users ON items.created_by = users.id
            WHERE 1=1
        """
        params = []
        
        if search_query:
            query += " AND (items.name LIKE %s OR items.description LIKE %s OR items.location LIKE %s)"
            params.extend(['%' + search_query + '%', '%' + search_query + '%', '%' + search_query + '%'])
        
        if status_filter:
            query += " AND items.status = %s"
            params.append(status_filter)
        
        query += " ORDER BY items.created_at DESC"
        
        cursor.execute(query, params)
        items = cursor.fetchall()
        
        return jsonify({"items": items})
    except Exception as e:
        return jsonify({"error": "Database error"}), 500
    finally:
        conn.close()

@app.route("/api/items", methods=["POST"])
@login_required
def create_item():
    try:
        name = request.form.get("name")
        description = request.form.get("description")
        location = request.form.get("location")
        status = request.form.get("status")
        
        if not all([name, description, location, status]):
            return jsonify({"error": "All fields are required"}), 400
        
        image_filename = None
        if 'image' in request.files:
            image = request.files['image']
            if image and allowed_file(image.filename):
                filename = secure_filename(image.filename)
                unique_filename = str(uuid.uuid4()) + "_" + filename
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                image.save(image_path)
                image_filename = f"uploads/{unique_filename}"

        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO items (name, description, location, status, image, created_by, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (name, description, location, status, image_filename, session["user_id"]))
        
        conn.commit()
        item_id = cursor.lastrowid
        
        return jsonify({"success": True, "item_id": item_id, "message": "Item registered successfully"})
    except Exception as e:
        return jsonify({"error": "Failed to register item"}), 500
    finally:
        conn.close()

@app.route("/api/items/<int:item_id>/claim", methods=["POST"])
@login_required
def claim_item(item_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if item exists and is not already claimed
        cursor.execute("SELECT * FROM items WHERE id = %s", (item_id,))
        item = cursor.fetchone()
        
        if not item:
            return jsonify({"error": "Item not found"}), 404
        
        if item[5] == 'claimed':  # Assuming status is at index 5
            return jsonify({"error": "Item already claimed"}), 400
        
        # Check if user already claimed this item
        cursor.execute("SELECT * FROM claims WHERE item_id = %s AND claimed_by = %s", (item_id, session["user_id"]))
        existing_claim = cursor.fetchone()
        
        if existing_claim:
            return jsonify({"error": "You have already claimed this item"}), 400
        
        # Insert the claim
        cursor.execute("""
            INSERT INTO claims (item_id, claimed_by, claimant_name, claimant_email, claimed_at)
            VALUES (%s, %s, %s, %s, NOW())
        """, (item_id, session["user_id"], session["name"], session["email"]))

        # Update the item's status to 'claimed'
        cursor.execute("UPDATE items SET status = 'claimed' WHERE id = %s", (item_id,))
        
        conn.commit()
        return jsonify({"success": True, "message": "Item claimed successfully"})
    except Exception as e:
        return jsonify({"error": "Failed to claim item"}), 500
    finally:
        conn.close()

@app.route("/api/messages", methods=["POST"])
@login_required
def send_message():
    data = request.get_json()
    receiver_id = data.get("receiver_id")
    item_id = data.get("item_id")
    message_text = data.get("message")

    if not all([receiver_id, item_id, message_text]):
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO messages (sender_id, receiver_id, item_id, message, sent_at)
            VALUES (%s, %s, %s, %s, NOW())
        """, (session["user_id"], receiver_id, item_id, message_text))
        
        conn.commit()
        return jsonify({"success": True, "message": "Message sent successfully"})
    except Exception as e:
        return jsonify({"error": "Failed to send message"}), 500
    finally:
        conn.close()

@app.route("/api/feedback", methods=["POST"])
@login_required
def submit_feedback():
    data = request.get_json()
    feedback_text = data.get("feedback")
    
    if not feedback_text:
        return jsonify({"error": "Feedback text is required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO feedback (user_id, feedback_text, submitted_at)
            VALUES (%s, %s, NOW())
        """, (session["user_id"], feedback_text))
        
        conn.commit()
        return jsonify({"success": True, "message": "Thank you for your feedback!"})
    except Exception as e:
        return jsonify({"error": "Failed to submit feedback"}), 500
    finally:
        conn.close()

# Admin routes
@app.route("/api/admin/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get all items
        cursor.execute("""
            SELECT items.*, users.name as creator_name 
            FROM items 
            JOIN users ON items.created_by = users.id
            ORDER BY items.created_at DESC
        """)
        items = cursor.fetchall()

        # Get all claims
        cursor.execute("""
            SELECT claims.*, items.name as item_name, users.name as claimer_name 
            FROM claims
            JOIN items ON claims.item_id = items.id
            JOIN users ON claims.claimed_by = users.id
            ORDER BY claims.claimed_at DESC
        """)
        claims = cursor.fetchall()

        # Get all users
        cursor.execute("SELECT id, name, email, role FROM users WHERE role != 'admin'")
        users = cursor.fetchall()

        # Get all feedback (FIXED)
        cursor.execute("""
            SELECT feedback.*, users.name as user_name 
            FROM feedback 
            JOIN users ON feedback.user_id = users.id
            ORDER BY feedback.submitted_at DESC
        """)
        feedback = cursor.fetchall()

        return jsonify({
            "items": items,
            "claims": claims,
            "users": users,
            "feedback": feedback
        })
    except Exception as e:
        print("Error in admin_dashboard:", e)
        return jsonify({"error": "Database error"}), 500
    finally:
        conn.close()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get all items
        cursor.execute("""
            SELECT items.*, users.name as creator_name 
            FROM items 
            JOIN users ON items.created_by = users.id
            ORDER BY items.created_at DESC
        """)
        items = cursor.fetchall()

        # Get all claims
        cursor.execute("""
            SELECT claims.*, items.name as item_name, users.name as claimer_name 
            FROM claims
            JOIN items ON claims.item_id = items.id
            JOIN users ON claims.claimed_by = users.id
            ORDER BY claims.claimed_at DESC
        """)
        claims = cursor.fetchall()

        # Get all users
        cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE role != 'admin'")
        users = cursor.fetchall()
        
        # Get all feedback
        cursor.execute("""
            SELECT feedback.*, users.name as user_name 
            FROM feedback 
            JOIN users ON feedback.user_id = users.id
            ORDER BY feedback.created_at DESC
        """)
        feedback = cursor.fetchall()
        
        return jsonify({
            "items": items,
            "claims": claims,
            "users": users,
            "feedback": feedback
        })
    except Exception as e:
        return jsonify({"error": "Database error"}), 500
    finally:
        conn.close()

@app.route("/api/admin/items/<int:item_id>", methods=["DELETE"])
@admin_required
def delete_item(item_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # First delete any claims associated with the item
        cursor.execute("DELETE FROM claims WHERE item_id = %s", (item_id,))
        
        # Delete any messages associated with the item
        cursor.execute("DELETE FROM messages WHERE item_id = %s", (item_id,))
        
        # Then delete the item from the items table
        cursor.execute("DELETE FROM items WHERE id = %s", (item_id,))
        
        conn.commit()
        return jsonify({"success": True, "message": "Item deleted successfully"})
    except Exception as e:
        return jsonify({"error": "Failed to delete item"}), 500
    finally:
        conn.close()

@app.route("/api/admin/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Delete claims associated with the user
        cursor.execute("DELETE FROM claims WHERE claimed_by = %s", (user_id,))
        
        # Delete messages sent by the user
        cursor.execute("DELETE FROM messages WHERE sender_id = %s OR receiver_id = %s", (user_id, user_id))
        
        # Delete feedback by the user
        cursor.execute("DELETE FROM feedback WHERE user_id = %s", (user_id,))
        
        # Delete items created by the user
        cursor.execute("DELETE FROM items WHERE created_by = %s", (user_id,))
        
        # Delete the user
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        
        conn.commit()
        return jsonify({"success": True, "message": "User deleted successfully"})
    except Exception as e:
        return jsonify({"error": "Failed to delete user"}), 500
    finally:
        conn.close()

@app.route("/api/admin/claims/<int:claim_id>", methods=["DELETE"])
@admin_required
def delete_claim(claim_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get the item_id before deleting the claim
        cursor.execute("SELECT item_id FROM claims WHERE id = %s", (claim_id,))
        result = cursor.fetchone()
        
        if result:
            item_id = result[0]
            
            # Delete the claim
            cursor.execute("DELETE FROM claims WHERE id = %s", (claim_id,))
            
            # Update item status back to available
            cursor.execute("UPDATE items SET status = 'available' WHERE id = %s", (item_id,))
            
            conn.commit()
            return jsonify({"success": True, "message": "Claim deleted successfully"})
        else:
            return jsonify({"error": "Claim not found"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to delete claim"}), 500
    finally:
        conn.close()

# Background job for cleaning old claims
def delete_old_claims():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Delete claims older than 7 days
        cursor.execute("""
            DELETE FROM claims WHERE claimed_at < %s
        """, (datetime.now() - timedelta(days=7),))
        claims_deleted = cursor.rowcount
        
        # Update items status back to available if no active claims
        cursor.execute("""
            UPDATE items 
            SET status = 'available' 
            WHERE status = 'claimed' AND id NOT IN (SELECT item_id FROM claims)
        """)
        items_updated = cursor.rowcount
        
        conn.commit()
        print(f"Deleted {claims_deleted} old claims and updated {items_updated} items.")
    except mysql.connector.Error as err:
        print(f"Error during cleanup: {err}")
    finally:
        conn.close()

# Initialize the scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=delete_old_claims, trigger="interval", hours=24)  # Run daily
scheduler.start()

# Ensure the scheduler shuts down properly when the app exits
atexit.register(lambda: scheduler.shutdown())

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)