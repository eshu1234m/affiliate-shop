import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

# --- CORS CONFIGURATION ---
# This allows your React app (hosted anywhere) to talk to this backend
CORS(app, resources={r"/*": {"origins": "*"}})

# --- DATABASE CONFIGURATION ---
# This logic checks if we are on Render (using DATABASE_URL) or on your laptop (using sqlite)
database_url = os.environ.get('DATABASE_URL', 'sqlite:///products.db')

# Fix for Render PostgreSQL (if you switch to a real DB later)
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- DATABASE MODEL ---
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    affiliate_link = db.Column(db.String(500), nullable=False)
    price = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(100), default="General")

# Create tables automatically
with app.app_context():
    db.create_all()

# --- ROUTES ---

# 1. GET: Fetch all products (Public)
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        # Sort by newest first (descending ID)
        products = Product.query.order_by(Product.id.desc()).all()
        output = []
        for product in products:
            output.append({
                'id': product.id,
                'title': product.title,
                'image_url': product.image_url,
                'link': product.affiliate_link,
                'price': product.price,
                'category': product.category
            })
        return jsonify(output)
    except Exception as e:
        return jsonify({"error": "Failed to fetch products", "details": str(e)}), 500

# 2. POST: Add a new product (Private)
@app.route('/api/add-product', methods=['POST'])
def add_product():
    # Security Check
    secret = request.headers.get('Admin-Secret')
    
    # You can also use an Environment Variable for the password on Render
    # If ADMIN_PASSWORD is set in Render, use it. Otherwise use the default.
    correct_password = os.environ.get('ADMIN_PASSWORD', 'my_super_secret_password_123')
    
    if secret != correct_password:
        return jsonify({"error": "Unauthorized: Wrong Password"}), 401

    data = request.json
    try:
        new_product = Product(
            title=data['title'],
            image_url=data['image_url'],
            affiliate_link=data['link'],
            price=data['price'],
            category=data.get('category', 'General')
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product added successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 3. Health Check (Useful for Render to know app is running)
@app.route('/', methods=['GET'])
def home():
    return "Backend is Running!"

if __name__ == '__main__':
    # Use the PORT environment variable if available (required for Render)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)