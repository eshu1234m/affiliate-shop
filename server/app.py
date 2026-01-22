import os
import json
import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
# Allow requests from anywhere (simplifies deployment)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- CONFIGURATION ---

# 1. Database (Works on Local + Render)
database_url = os.environ.get('DATABASE_URL', 'sqlite:///products.db')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 2. AI Configuration
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# 3. YOUR Affiliate Tag (UPDATED)
MY_AMAZON_TAG = "eshwardeals-21" 

db = SQLAlchemy(app)

# --- DATABASE MODEL ---
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    affiliate_link = db.Column(db.String(500), nullable=False)
    price = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(100), default="General")
    description = db.Column(db.String(1000), default="") # AI Description

with app.app_context():
    db.create_all()

# --- HELPER FUNCTIONS ---

def convert_to_affiliate(url, tag):
    """Adds your Amazon tag to the link automatically"""
    if "amazon" in url or "amzn" in url:
        # Check if tag already exists to avoid duplication
        if "tag=" in url:
            return url 
        
        separator = "&" if "?" in url else "?"
        return f"{url}{separator}tag={tag}"
    return url

def ai_enhance_product(title, raw_price):
    """Uses Gemini to clean title, categorize, and write description"""
    if not GEMINI_API_KEY:
        return {
            "category": "General", 
            "description": "AI Key missing. Add GEMINI_API_KEY to Render.", 
            "clean_title": title
        }
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = f"""
        Analyze this product: "{title}". Price: {raw_price}.
        
        Return a JSON object with these 3 fields:
        1. "category": One word category (e.g. Tech, Home, Fashion).
        2. "clean_title": A short, catchy title (max 50 chars).
        3. "description": A short, exciting 2-sentence sales pitch.
        
        Respond ONLY with valid JSON.
        """
        response = model.generate_content(prompt)
        # Clean up code blocks if AI adds them
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        print(f"AI Error: {e}")
        return {"category": "General", "description": "", "clean_title": title}

# --- ROUTES ---

@app.route('/api/smart-scrape', methods=['POST'])
def smart_scrape():
    data = request.json
    url = data.get('url')
    
    # Pretend to be a browser
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        # 1. Scrape Basic Info
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find Title
        title_tag = soup.find(id='productTitle')
        raw_title = title_tag.get_text().strip() if title_tag else soup.title.string

        # Find Image
        image_tag = soup.find("meta", property="og:image")
        image_url = image_tag["content"] if image_tag else ""

        # Find Price (Simple logic)
        price_whole = soup.find(class_='a-price-whole')
        raw_price = f"₹{price_whole.get_text().strip()}" if price_whole else "Check Price"

        # 2. Add Affiliate Tag (Using your new tag)
        smart_link = convert_to_affiliate(url, MY_AMAZON_TAG)

        # 3. Ask AI to improve it
        ai_data = ai_enhance_product(raw_title, raw_price)

        return jsonify({
            "title": ai_data.get('clean_title', raw_title),
            "original_title": raw_title,
            "image_url": image_url,
            "price": raw_price,
            "link": smart_link,
            "category": ai_data.get('category', 'General'),
            "description": ai_data.get('description', '')
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.order_by(Product.id.desc()).all()
    output = []
    for p in products:
        output.append({
            'id': p.id,
            'title': p.title,
            'image_url': p.image_url,
            'link': p.affiliate_link,
            'price': p.price,
            'category': p.category,
            'description': p.description
        })
    return jsonify(output)

@app.route('/api/add-product', methods=['POST'])
def add_product():
    secret = request.headers.get('Admin-Secret')
    correct_password = os.environ.get('ADMIN_PASSWORD', 'my_super_secret_password_123')
    
    if secret != correct_password:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    new_product = Product(
        title=data['title'],
        image_url=data['image_url'],
        affiliate_link=data['link'],
        price=data['price'],
        category=data.get('category', 'General'),
        description=data.get('description', '')
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({"message": "Product saved!"})

@app.route('/', methods=['GET'])
def home():
    return "Smart Backend is Running!"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)