// Ambil elemen-elemen yang diperlukan dari halaman HTML
const fileInput = document.getElementById('file-input');
const uploadOCRButton = document.getElementById('uploadOCR');
const noteContent = document.getElementById('noteContent');
const imagePreview = document.getElementById('image-preview');

// Tambahkan event listener untuk tombol upload & OCR
uploadOCRButton.addEventListener('click', function(event) {
    event.preventDefault();

    // Pastikan ada file yang dipilih
    if (fileInput.files.length === 0) {
        alert('Please select a file first.');
        return;
    }

    // Ambil file yang dipilih oleh pengguna
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // Kirim permintaan POST ke endpoint /ocr di server
    fetch('/ocr', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('OCR request failed.');
        }
        return response.text();
    })
    .then(text => {
        // Tampilkan hasil OCR di textarea noteContent
        noteContent.value = text;
    })
    .catch(error => {
        console.error('Error during OCR request:', error);
        alert('OCR request failed. Please try again.');
    });
});

// Event listener untuk menampilkan preview gambar saat dipilih
fileInput.addEventListener('change', function(event) {
    const input = event.target;
    const reader = new FileReader();
    reader.onload = function(){
        const dataURL = reader.result;
        imagePreview.src = dataURL;
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
});
