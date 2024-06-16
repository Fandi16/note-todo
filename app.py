# Import library Flask dan modul lain yang diperlukan
from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename
import os
import pytesseract
from PIL import Image
import base64
import re
from io import BytesIO

# Inisialisasi Flask
app = Flask(__name__)
app.debug = True

# Direktori untuk menyimpan file sementara
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Fungsi untuk menampilkan halaman beranda
@app.route('/')
def home():
    return render_template('index.html')
@app.route('/profile')
def profile():
    return render_template('profile.html')

# Fungsi untuk mengambil gambar dari kamera
@app.route('/capture', methods=['POST'])
def capture_image():
    if request.method == 'POST':
        # Mendapatkan data gambar dari request
        data_url = request.values['imageBase64']
        # Mengubah data URL menjadi gambar dan menyimpannya
        image_data = re.sub('^data:image/.+;base64,', '', data_url)
        image = Image.open(BytesIO(base64.b64decode(image_data)))
        filename = os.path.join(app.config['UPLOAD_FOLDER'], 'captured_image.png')
        image.save(filename)
        return redirect(url_for('uploaded_file', filename='captured_image.png'))

# Fungsi untuk mengunggah gambar
@app.route('/upload', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        # Pastikan file yang diunggah merupakan gambar
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            return redirect(url_for('uploaded_file', filename=filename))

# Fungsi untuk menampilkan pratinjau gambar yang diunggah
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return render_template('uploaded.html', filename=filename)

# Fungsi untuk melakukan OCR pada gambar yang diunggah
def perform_ocr(image_file):
    # Buka gambar dengan PIL
    img = Image.open(image_file)
    # Lakukan OCR menggunakan Tesseract
    text = pytesseract.image_to_string(img)
    return text

@app.route('/ocr', methods=['POST'])
def ocr_image():
    if request.method == 'POST':
        file = request.files['file']  # Mengakses file yang diunggah
        text = perform_ocr(file)  # Melakukan OCR pada gambar
        return text

# Anda dapat menambahkan rute dan fungsi untuk fungsi lainnya seperti brighten_image, invert, dll.

# Menjalankan aplikasi Flask
if __name__ == '__main__':
    app.run(debug=True)
