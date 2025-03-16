import os
import json
import base64
import requests
from flask import Flask, request, jsonify
from services import handwriting_service, speech_service
from datetime import datetime

app = Flask(__name__)

# Initialize your proprietary services
gcloud_key = os.environ['GOOGLE_APPLICATION_CREDENTIALS']
handwriting_service = handwriting_service.HandwritingAnalysisService()
speech_service = speech_service.SpeechAnalysisService() 
# speech_service = SpeechAnalysisService()

@app.route('/writing-analysis', methods=['POST'])
def analyze_writing():
    """
    Endpoint to analyze handwriting samples
    
    Expected JSON request format:
    {
        "sample_id": "unique_identifier",
        "image_data": "base64_encoded_image_or_file_path",
        "parameters": {
            "detail_level": "high|medium|low",
            "additional_options": {}
        }
    }
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ["content", "mimeType"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:

        # Use your proprietary service to analyze the handwriting
        token_data = handwriting_service.extract_token_data()
        spacing_data = handwriting_service.calculate_spacing(token_data)
        trends = handwriting_service.analyze_trends(token_data, spacing_data)
        
        
        return jsonify({
            "trends": json.dumps(trends).encode('utf-8'),
            "timestamp_utc": str(datetime.now()), 
            "status": "success"
        })
    
    except Exception as e:
        return jsonify({
            "error": f"{e}",
            "status": "failed"
        }), 500

@app.route('/speech-analysis', methods=['POST'])
def speech_analysis():

    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    
    required_fields = ["content"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
        
    try: 
        base64_content = data.get('content')
        raw_content = base64.b64decode(base64_content)
        analyzed_audio = speech_service.analyze_audio(raw_content)
        updrs_score = speech_service.calculate_updrs_score(analyzed_audio)
        return jsonify({
            "score": updrs_score,
            "timestamp_utc": str(datetime.now()),
            "status": "success"
        })
    
    except Exception as e:
        return jsonify({
            "error": f"{e}",
            "status": "failed"
        }), 500

# Add a basic health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "services": {
            "handwriting_analysis": handwriting_service.status(),
            # "speech_analysis": speech_service.status()
        }
    })

if __name__ == '__main__':
    # For development only - use a proper WSGI server in production
    app.run(host='0.0.0.0', port=5000, debug=False)