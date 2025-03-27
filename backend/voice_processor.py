from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import whisper
import uuid
from pydub import AudioSegment
import logging
import traceback

# --- Config ---
TEMP_DIR = 'temp_audio'  # ✅ Corrected path
WHISPER_MODEL = 'base'

# --- Init ---
app = Flask(__name__)
CORS(app)
os.makedirs(TEMP_DIR, exist_ok=True)  # ✅ Ensure folder exists

# --- Logging ---
logging.basicConfig(
    level=logging.DEBUG,
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)

# --- Load Whisper ---
try:
    model = whisper.load_model(WHISPER_MODEL)
    logging.info(f"✅ Whisper model '{WHISPER_MODEL}' loaded successfully.")
except Exception as e:
    logging.critical(f"❌ Failed to load Whisper model: {e}")
    raise

# --- Whiteboard Command Mapping ---
COMMANDS = {
    "circle": "draw_circle",
    "rectangle": "draw_rectangle",
    "square": "draw_square",
    "triangle": "draw_triangle",
    "line": "draw_line",
    "arrow": "draw_arrow",
    "text": "add_text",
    "clear": "clear_canvas",
    "undo": "undo",
    "redo": "redo",
    "download": "save",
    "zoom in": "zoom_in",
    "zoom out": "zoom_out",
    "delete": "delete_selected"
}

def map_transcript_to_command(transcript: str) -> str:
    """Maps spoken text to a whiteboard command."""
    transcript = transcript.lower().strip()
    logging.debug(f"🎙 Processing transcript: '{transcript}'")
    for phrase, action in COMMANDS.items():
        if phrase in transcript:
            return action
    return "unknown_command"

# --- Audio Processing ---
def convert_webm_to_wav(input_path, wav_path):
    try:
        # ✅ Convert WebM to WAV
        audio = AudioSegment.from_file(input_path, format="webm")
        audio = audio.set_channels(1).set_frame_rate(16000)  # Whisper needs 16kHz mono
        audio = audio.apply_gain(10)  # 🔊 Boost volume
        audio.export(wav_path, format="wav")
        logging.info(f"✅ Converted WebM to WAV: {wav_path}")
        return True
    except Exception as e:
        logging.error(f"❌ Failed to convert WebM to WAV: {e}")
        return False

def transcribe_audio(wav_path):
    try:
        logging.info(f"🔍 Transcribing: {wav_path}")
        result = model.transcribe(wav_path)
        transcript = result.get("text", "").strip()
        logging.info(f"📝 Transcription: '{transcript}'")

        if not transcript:
            logging.warning("⚠️ Whisper returned an empty transcript.")
            return None

        return transcript
    except Exception as e:
        logging.error(f"❌ Whisper transcription failed: {e}")
        return None


# --- Endpoint ---
@app.route('/process-command', methods=['POST'])
def process_command():
    if 'audio' not in request.files:
        logging.warning("❌ No 'audio' file found in request.")
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    uid = str(uuid.uuid4())
    input_path = os.path.join(TEMP_DIR, f'{uid}.webm')
    wav_path = os.path.join(TEMP_DIR, f'{uid}.wav')

    try:
        # ✅ Save the WebM file
        audio_file.save(input_path)
        logging.info(f"✅ Audio saved: {input_path}")

        # ✅ Convert WebM to WAV
        success = convert_webm_to_wav(input_path, wav_path)
        if not success:
            return jsonify({"error": "Audio conversion failed"}), 500

        # ✅ Transcribe with Whisper
        transcript = transcribe_audio(wav_path)
        if not transcript:
            return jsonify({"action": "unknown_command", "transcript": ""})

        # ✅ Map transcript to a command
        action = map_transcript_to_command(transcript)
        logging.info(f"🎯 Mapped command: {action}")

        return jsonify({'action': action, 'transcript': transcript})

    except Exception as e:
        logging.error(f"❌ Error processing command: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

    finally:
        # ✅ Cleanup temp files
        for path in [input_path, wav_path]:
            if os.path.exists(path):
                os.remove(path)
                logging.debug(f"🗑 Deleted temp file: {path}")



@app.route('/')
def index():
    return jsonify({"message": "VoxBoard backend is up and running!"})

if __name__ == '__main__':
    app.run(debug=True)
