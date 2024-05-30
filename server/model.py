# model.py
import numpy as np
import tensorflow as tf
from PIL import Image

# Load TFLite model and allocate tensors.
interpreter = tf.lite.Interpreter(model_path="1.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

def preprocess_image(image_path):
    # Open image, resize to 300x300, and preprocess
    img = Image.open(image_path).convert('RGB')
    img = img.resize((300, 300))
    img = np.array(img)
    img = np.expand_dims(img, axis=0)
    return img

def run_inference(image_path):
    input_data = preprocess_image(image_path)
    
    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], input_data)
    
    # Run inference
    interpreter.invoke()
    
    # Get the output tensor
    output_data = {
        'boxes': interpreter.get_tensor(output_details[0]['index']).tolist(),
        'classes': interpreter.get_tensor(output_details[1]['index']).tolist(),
        'scores': interpreter.get_tensor(output_details[2]['index']).tolist(),
        'num_detections': interpreter.get_tensor(output_details[3]['index']).tolist()
    }
    
    return output_data
