# server.py
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from model import run_inference

app = Flask(__name__)

UPLOAD_FOLDER = 'E:/projects/server/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



@app.route("/hello")
def hello_world():
    return jsonify({'message': 'Just came from Flask Server'})


@app.route("/upload_image", methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image found in the request'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Run inference
        output_data = run_inference(filepath)
        
        return jsonify({'message': 'Image uploaded successfully', 'inference': output_data}), 200
    else:
        return jsonify({'error': 'Invalid image format'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
