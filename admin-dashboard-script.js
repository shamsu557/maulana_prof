// Global variables
let currentSection = 'dashboard';
let books = []; // Changed 'shoot' to 'books'
let audio = [];
let videos = [];
let transactions = [];
let assistants = [];
let balance = 0;
let currentModalType = '';
let deleteItem = null;

// API configuration
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : window.location.origin;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
  // Initialize Lucide icons
  lucide.createIcons();
});

// Initialize application
async function initializeApp() {
  try {
    await checkAuth();
    setupEventListeners();
    await loadData(); // Load data after auth and event listeners
  } catch (error) {
    console.error('Initialization error:', error);
    showDashboard(); // Fallback to show dashboard for testing
  }
}

// Check authentication status
async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth-check`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    if (data.authenticated) {
      showDashboard();
    } else {
      window.location.href = '/admin-login.html'; // Consistent with goToLogin
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    window.location.href = '/admin-login.html'; // Redirect on error
  }
}

// Show dashboard
function showDashboard() {
  document.getElementById('main-dashboard').classList.remove('d-none');
}

// Show access denied (not used since access-denied element is missing)
function showAccessDenied() {
  console.warn('Access denied page not available');
  window.location.href = '/admin-login.html';
}

// Go to login page
function goToLogin() {
  window.location.href = '/admin-login.html';
}

// Setup event listeners
function setupEventListeners() {
  // Sidebar navigation
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const section = this.dataset.section;
      switchSection(section);
    });
  });
  // Navbar toggle is irrelevant; skip setupNavbarToggle
}

// Switch sections
function switchSection(section) {
  // Update active sidebar button
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-section="${section}"]`).classList.add('active');

  // Hide all sections
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.remove('active');
  });

  // Show selected section
  document.getElementById(`${section}-section`).classList.add('active');

  currentSection = section;
}
//load audio data
async function loadAudioData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/audio`);
    if (!response.ok) {
      throw new Error(`Failed to load audio: ${response.statusText}`);
    }

    const audioData = await response.json();

    // Debug: check what the backend sends
    console.log("Fetched audio data:", audioData);

    // Store globally if needed
    audio = audioData;

    // Populate the table
    updateAudioTable(audio);

    // Update count
    document.getElementById('total-audio').textContent = audio.length;

  } catch (error) {
    console.error("Error loading audio:", error);
    document.getElementById('total-audio').textContent = 0;
  }
}


// Load video data
async function loadVideoData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos`);
    if (!response.ok) {
      throw new Error(`Failed to load videos: ${response.statusText}`);
    }

    const videoData = await response.json();

    // Debug: check what the backend sends
    console.log("Fetched video data:", videoData);

    // Store globally if needed
    videos = videoData;

    // Populate the table or UI element for videos
    updateVideosTable(videos);

    // Update count
    document.getElementById('total-videos').textContent = videos.length;

  } catch (error) {
    console.error("Error loading videos:", error);
    document.getElementById('total-videos').textContent = 0;
  }
}

// Call this separately
loadAudioData();
loadVideoData();

// Load all data
async function loadData() {
  try {
    // Load all data in parallel
    const [booksRes, audioRes, videosRes, transactionsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/books`),
      fetch(`${API_BASE_URL}/api/transactions`),
    ]);

    if (booksRes.ok) {
      books = await booksRes.json();
      updateBooksTable();
      document.getElementById('total-books').textContent = books.length;
    }
    if (transactionsRes.ok) {
      transactions = await transactionsRes.json();
      updateTransactionsTable();
      calculateBalance();
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Calculate balance
function calculateBalance() {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  balance = totalIncome - totalExpense;

  document.getElementById('current-balance').textContent = `₦${balance.toLocaleString()}`;
  document.getElementById('balance-display').textContent = `₦${balance.toLocaleString()}`;
}

// Update books table with a Delete button on each row
function updateBooksTable() {
  const tbody = document.getElementById('books-table-body');
  tbody.innerHTML = '';

  books.forEach(book => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title_english}</td>
      <td class="arabic">${book.title_arabic}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteBook(${book.id})">
          <i data-lucide="trash-2"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  lucide.createIcons();
}

// Delete a single book
async function handleDeleteBook(bookId) {
  if (!confirm('Are you sure you want to delete this book?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/books/${bookId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      alert('Book deleted successfully!');
      await loadData(); // refresh list
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to delete book');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    alert('Error deleting book');
  }
}

// Update audio table
function updateAudioTable() {
  const tbody = document.getElementById('audio-table-body');
  tbody.innerHTML = '';

  audio.forEach(item => {   // Use 'audio' array, not 'audios'
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.title_english}</td>
      <td class="arabic">${item.title_arabic}</td>
      <td>${item.section}</td>
      <td class="arabic">${item.section_arabic}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteAudio(${item.id})">
          <i data-lucide="trash-2"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  lucide.createIcons();
}
// Delete single audio
async function handleDeleteAudio(audioId) {
  if (!confirm('Are you sure you want to delete this audio?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/audio/${audioId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      alert('Audio deleted successfully!');
      await loadAudioData();
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to delete audio');
    }
  } catch (error) {
    console.error('Error deleting audio:', error);
    alert('Error deleting audio');
  }
}

// Update video table
function updateVideosTable() {
  const tbody = document.getElementById('videos-table-body');
  tbody.innerHTML = '';

  videos.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.title_english}</td>
      <td class="arabic">${item.title_arabic}</td>
      
      <td>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteVideo(${item.id})">
          <i data-lucide="trash-2"></i> Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  lucide.createIcons();
}

// Delete single video
async function handleDeleteVideo(videoId) {
  if (!confirm('Are you sure you want to delete this video?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/videos/${videoId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      alert('Video deleted successfully!');
      await loadVideoData();
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to delete video');
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    alert('Error deleting video');
  }
}

// Update transactions table
function updateTransactionsTable() {
  const tbody = document.getElementById('transactions-table-body');
  tbody.innerHTML = '';
  transactions.forEach(transaction => {
    const row = document.createElement('tr');
    const date = new Date(transaction.created_at || transaction.date).toLocaleDateString();
    const isIncome = transaction.type === 'income';

    row.innerHTML = `
      <td>${date}</td>
      <td>
        <span class="badge ${isIncome ? 'bg-success' : 'bg-danger'}">
          ${isIncome ? 'Income' : 'Expense'}
        </span>
      </td>
      <td>${transaction.description}</td>
      <td>${transaction.donor_name || transaction.reference || '-'}</td>
      <td class="fw-bold ${isIncome ? 'text-success' : 'text-danger'}">
        ${isIncome ? '+' : '-'}₦${parseFloat(transaction.amount).toLocaleString()}
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Show add modal
function showAddModal(type) {
  currentModalType = type;
  const modal = new bootstrap.Modal(document.getElementById('addModal'));
  const title = document.getElementById('add-modal-title');
  const formFields = document.getElementById('form-fields');
  const submitBtn = document.getElementById('add-submit-btn');

  title.textContent = `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;

  submitBtn.className = `btn btn-${getButtonColor(type)}`;

  formFields.innerHTML = generateFormFields(type);

  modal.show();

  lucide.createIcons();
}

// Get button color for type
function getButtonColor(type) {
  const colors = {
    book: 'primary',
    audio: 'success',
    video: 'warning',
    expense: 'danger',
    assistant: 'info',
  };
  return colors[type] || 'primary';
}

// Generate form fields
// Generate form fields
function generateFormFields(type) {
  switch (type) {
    case 'book':
      return `
       <d iv class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Title (English)</label>
            <input type="text" class="form-control" name="title_english" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">Title (Arabic)</label>
            <input type="text" class="form-control arabic" name="title_arabic" required>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Cover Image</label>
            <input type="file" class="form-control" name="cover_image" accept="image/*" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">PDF File</label>
            <input type="file" class="form-control" name="pdf_file" accept=".pdf" required>
          </div>
        </div>
      `;
    case 'audio':
      return `
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Title (English)</label>
            <input type="text" class="form-control" name="title_english" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">Title (Arabic)</label>
            <input type="text" class="form-control arabic" name="title_arabic" required>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Section (English)</label>
            <select class="form-control" name="section" required>
              <option value="">Select Section</option>
              <option value="Sahihul Bukhari">Sahihul Bukhari</option>
              <option value="Sahihul Bukhari (Bita Tare Da Malamai)">Sahihul Bukhari (Bita Tare Da Malamai)</option>
              <option value="Sahihul Muslim">Sahihul Muslim</option>
              <option value="Muwadda Malik">Muwadda Malik</option>
              <option value="Attajul Jamiu Lil usul">Attajul Jamiu Lil usul</option>
              <option value="Bulughul Maram">Bulughul Maram</option>
              <option value="Ihya'u Ulumiddeen">Ihya'u Ulumiddeen</option>
              <option value="Jam'ul Jawami'i Fi Ilmi Usulil Fiqh">Jam'ul Jawami'i Fi Ilmi Usulil Fiqh</option>
              <option value="Lectures">Lectures</option>
              <option value="Discussions">Discussions</option>
              <option value="Majlisi">Majlisi</option>
              <option value="Questions & Answers 2013">Questions & Answers 2013</option>
              <option value="Questions & Answers 2014">Questions & Answers 2014</option>
              <option value="Questions & Answers 2015">Questions & Answers 2015</option>
              <option value="Questions & Answers 2016">Questions & Answers 2016</option>
              <option value="Questions & Answers 2017">Questions & Answers 2017</option>
              <option value="Questions & Answers 2018">Questions & Answers 2018</option>
              <option value="Questions & Answers 2019">Questions & Answers 2019</option>
              <option value="Tafseer 2013">Tafseer 2013</option>
              <option value="Tafseer 2014">Tafseer 2014</option>
              <option value="Tafseer 2015">Tafseer 2015</option>
              <option value="Tafseer 2016">Tafseer 2016</option>
              <option value="Tafseer 2017">Tafseer 2017</option>
              <option value="Tafseer 2018">Tafseer 2018</option>
              <option value="Tafseer 2019">Tafseer 2019</option>
              <option value="Tafseer 2020">Tafseer 2020</option>
              <option value="Tafseer 2021">Tafseer 2021</option>
              <option value="Tafseer 2022">Tafseer 2022</option>
              <option value="Tafseer 2023">Tafseer 2023</option>
              <option value="Tafseer 2024">Tafseer 2024</option>
              <option value="Tafseer 2025">Tafseer 2025</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Section (Arabic)</label>
            <select class="form-control arabic" name="section_arabic" required>
              <option value="">اختر القسم</option>
              <option value="صحيح البخاري">صحيح البخاري</option>
              <option value="صحيح البخاري (بيت التاريخ مع المعلمين)">صحيح البخاري (بيت التاريخ مع المعلمين)</option>
              <option value="صحيح مسلم">صحيح مسلم</option>
              <option value="مواضع مالك">مواضع مالك</option>
              <option value="التاج الجامع للأصول">التاج الجامع للأصول</option>
              <option value="بلوغ المرام">بلوغ المرام</option>
              <option value="إحياء علوم الدين">إحياء علوم الدين</option>
              <option value="جامع الجوامع في علم أصول الفقه">جامع الجوامع في علم أصول الفقه</option>
              <option value="محاضرات">محاضرات</option>
              <option value="مناقشات">مناقشات</option>
              <option value="مجلسي">مجلسي</option>
              <option value="أسئلة وأجوبة 2013">أسئلة وأجوبة 2013</option>
              <option value="أسئلة وأجوبة 2014">أسئلة وأجوبة 2014</option>
              <option value="أسئلة وأجوبة 2015">أسئلة وأجوبة 2015</option>
              <option value="أسئلة وأجوبة 2016">أسئلة وأجوبة 2016</option>
              <option value="أسئلة وأجوبة 2017">أسئلة وأجوبة 2017</option>
              <option value="أسئلة وأجوبة 2018">أسئلة وأجوبة 2018</option>
              <option value="أسئلة وأجوبة 2019">أسئلة وأجوبة 2019</option>
              <option value="تفسير 2013">تفسير 2013</option>
              <option value="تفسير 2014">تفسير 2014</option>
              <option value="تفسير 2015">تفسير 2015</option>
              <option value="تفسير 2016">تفسير 2016</option>
              <option value="تفسير 2017">تفسير 2017</option>
              <option value="تفسير 2018">تفسير 2018</option>
              <option value="تفسير 2019">تفسير 2019</option>
              <option value="تفسير 2020">تفسير 2020</option>
              <option value="تفسير 2021">تفسير 2021</option>
              <option value="تفسير 2022">تفسير 2022</option>
              <option value="تفسير 2023">تفسير 2023</option>
              <option value="تفسير 2024">تفسير 2024</option>
              <option value="تفسير 2025">تفسير 2025</option>
            </select>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Audio File</label>
          <input type="file" class="form-control" name="audio_file" accept="audio/*" required>
        </div>
      `;
    case 'video':
      return `
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Title (English)</label>
            <input type="text" class="form-control" name="title_english" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">Title (Arabic)</label>
            <input type="text" class="form-control arabic" name="title_arabic" required>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">YouTube Video URL</label>
          <input type="url" class="form-control" name="video_url" placeholder="https://www.youtube.com/watch?v=..." required>
        </div>
      `;
    case 'expense':
      return `
        <div class="mb-3">
          <label class="form-label">Amount (₦)</label>
          <input type="number" class="form-control" name="amount" min="1" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" name="description" rows="3" placeholder="What was this expense for?" required></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">Date</label>
          <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
      `;
    case 'assistant':
      return `
        <div class="mb-3">
          <label class="form-label">Username</label>
          <input type="text" class="form-control" name="username" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" name="password" minlength="6" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" name="email" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Phone</label>
          <input type="tel" class="form-control" name="phone" required>
        </div>
      `;
    default:
      return '';
  }
}

//handle add item
async function handleAddItem() {
  const form = document.getElementById('add-form');
  const formData = new FormData(form);

  try {
    let endpoint = '';
    let method = 'POST';
    let body;
    let headers = {};

    switch (currentModalType) {
      case 'book':
        endpoint = '/api/admin/books';
        body = formData; // multipart/form-data
        break;
      case 'audio':
        endpoint = '/api/admin/audio';
        body = formData; // multipart/form-data
        break;
      case 'video':
        endpoint = '/api/admin/videos';
        // For video, send JSON instead of FormData
        body = JSON.stringify(Object.fromEntries(formData));
        headers['Content-Type'] = 'application/json';
        break;
      case 'expense':
        endpoint = '/api/admin/expenses';
        body = JSON.stringify(Object.fromEntries(formData));
        headers['Content-Type'] = 'application/json';
        break;
      case 'assistant':
        endpoint = '/api/admin/assistants';
        body = JSON.stringify(Object.fromEntries(formData));
        headers['Content-Type'] = 'application/json';
        break;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      credentials: 'include',
      headers,
      body,
    });

    if (response.ok) {
      bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
      await loadData();
      await loadAudioData();
      await loadVideoData();
      alert(`${currentModalType.charAt(0).toUpperCase() + currentModalType.slice(1)} added successfully!`);
    } else {
      const error = await response.json();
      alert(error.error || `Failed to add ${currentModalType}`);
    }
  } catch (error) {
    console.error(`Error adding ${currentModalType}:`, error);
    alert(`Error adding ${currentModalType}`);
  }
}
// Show delete modal
function showDeleteModal(type, id, name) {
  deleteItem = { type, id, name };

  const modal = new bootstrap.Modal(document.getElementById(' demodal'));
  document.getElementById('delete-item-name').textContent = name;
  document.getElementById('delete-password').value = '';

  modal.show();
}

// Confirm delete
async function confirmDelete() {
  if (!deleteItem) return;

  const password = document.getElementById('delete-password').value;
  if (!password) {
    alert('Please enter your password');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/${deleteItem.type}/${deleteItem.id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
      await loadData();
      alert(`${deleteItem.type.charAt(0).toUpperCase() + deleteItem.type.slice(1)} deleted successfully!`);
      deleteItem = null;
    } else {
      const error = await response.json();
      alert(error.error || `Failed to delete ${deleteItem.type}`);
    }
  } catch (error) {
    console.error(`Error deleting ${deleteItem.type}:`, error);
    alert(`Error deleting ${deleteItem.type}`);
  }
}

// Generate report
function generateReport() {
  const fromDate = document.getElementById('report-date-from').value;
  const toDate = document.getElementById('report-date-to').value;

  if (!fromDate || !toDate) {
    alert('Please select both start and end dates');
    return;
  }

  const filteredTransactions = transactions.filter(t => {
    const transDate = new Date(t.created_at || t.date);
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return transDate >= from && transDate <= to;
  });

  const reportWindow = window.open('', '_blank');
  if (reportWindow) {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d6efd; padding-bottom: 20px; }
          .logo { max-width: 100px; margin-bottom: 10px; }
          .report-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .report-table th, .report-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .report-table th { background-color: #f8f9fa; font-weight: bold; }
          .summary { margin: 20px 0; padding: 15px; background-color: #e3f2fd; border-radius: 8px; }
          .signature-section { margin-top: 50px; padding-top: 30px; border-top: 1px solid #ddd; }
          .signature-line { border-bottom: 1px solid #000; width: 200px; margin: 20px 0; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/placeholder-logo.png" alt="Logo" class="logo">
          <h1>Prof. Ibrahim Ahmad Maqari</h1>
          <h2>Financial Report</h2>
          <p><strong>Period:</strong> ${fromDate} to ${toDate}</p>
          <p><strong>Email:</strong> 1440shamsusabo@gmail.com</p>
          <p><strong>Phone:</strong> 08030909793</p>
          <p><strong>Address:</strong> Nigeria</p>
        </div>
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Income:</strong> ₦${totalIncome.toLocaleString()}</p>
          <p><strong>Total Expenses:</strong> ₦${totalExpense.toLocaleString()}</p>
          <p><strong>Current Balance:</strong> ₦${balance.toLocaleString()}</p>
        </div>
        <table class="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Donor/Reference</th>
              <th>Amount (₦)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions
              .map(
                t => `
              <tr>
                <td>${new Date(t.created_at || t.date).toLocaleDateString()}</td>
                <td>${t.type === 'income' ? 'Income' : 'Expense'}</td>
                <td>${t.description}</td>
                <td>${t.donor_name || t.reference || '-'}</td>
                <td>${t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toLocaleString()}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="signature-section">
          <p><strong>Secretary Signature:</strong></p>
          <div class="signature-line"></div>
          <p>Date: ________________</p>
        </div>
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="background: #0d6efd; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Print Report</button>
        </div>
      </body>
      </html>
    `);
    reportWindow.document.close();
  }
}

// Sidebar "Messages" button click
document.querySelector('[data-section="messages"]').addEventListener('click', () => {
    // Hide all other content sections
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('d-none'));

    // Show the messages section
    document.getElementById('messages-section').classList.remove('d-none');

    // Load the messages
    loadMessages();
});

// Fetch and display messages
function loadMessages() {
    fetch('/api/admin/messages', { cache: 'no-store' }) // force fresh data
        .then(res => res.json())
        .then(messages => {
            const tbody = document.getElementById('messages-table-body');
            tbody.innerHTML = '';

            if (messages.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center">No messages found</td></tr>`;
                return;
            }

            messages.forEach(msg => {
                const tr = document.createElement('tr');
                tr.classList.add('table-danger'); // All red since we now delete instead of treat

                tr.innerHTML = `
                    <td>${msg.name}</td>
                    <td>${msg.email}</td>
                    <td>${msg.phone || ''}</td>
                    <td>${msg.category || ''}</td>
                    <td>${msg.subject || ''}</td>
                    <td>${msg.message}</td>
                    <td>${new Date(msg.created_at).toLocaleString()}</td>
                    <td>
                        <button 
                            class="btn btn-sm btn-danger"
                            onclick="deleteMessage(${msg.id}, this)"
                        >
                            Treated ? Delete
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error('Error loading messages:', err);
        });
}

// Delete message
function deleteMessage(id, btn) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                btn.closest('tr').remove();
            } else {
                console.error('Failed to delete message:', data.error);
            }
        })
        .catch(err => {
            console.error('Error deleting message:', err);
        });
}
// Handle logout
async function handleLogout() {
  try {
    await fetch(`${API_BASE_URL}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/admin-login.html';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/index.html';
  }
}
