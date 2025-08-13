let currentLanguage = 'english';
let videoFiles = [];
let filteredVideos = [];
let currentFilter = 'all';
let paystackLoaded = false;
let paymentLoading = false;
let currentVideoModal = null;

const translations = {
    english: {
        site_title: "Prof. I. A. Maqari",
        nav_home: "Home",
        nav_audio: "Audio",
        nav_videos: "Videos",
        nav_admin: "Admin",
        donate_btn: "Support Islam",
        language_switch: "عربي",
        videos_title: "Video Collection",
        search_placeholder: "Search videos by title...",
        loading_text: "Loading...",
        loading_videos: "Loading videos...",
        filter_all: "All Videos",
        filter_youtube: "YouTube",
        filter_local: "Local Videos",
        watch_btn: "Play",
        close_video: "Close",
        footer_contact_title: "Contact Information",
        footer_email: "📧 1440shamsusabo@gmail.com",
        footer_phone: "📞 08030909793",
        footer_location: "📍 Nigeria",
        footer_quick_links: "Quick Links",
        footer_home: "Home",
        footer_audio: "Audio",
        footer_videos: "Videos",
        footer_admin: "Admin",
        footer_support_title: "Support Our Work",
        footer_donate: "Support Islamic Education",
        footer_language: "Switch Language",
        developed_by: "Developed by",
        sponsored_by: "Sponsored by",
        donation_title: "Support Islamic Education & Da'wah",
        donation_subtitle: "Help us spread Islamic knowledge and support Prof. Maqari's educational mission",
        paystack_loading: "Loading payment system...",
        donor_name_label: "Donor Name",
        amount_label: "Amount (₦)",
        donor_email_label: "Email (Optional)",
        donor_phone_label: "Phone (Optional)",
        cancel_text: "Cancel",
        donate_now: "Donate Now - Support Islam",
        no_videos_found: "No videos found matching your search.",
        processing_payment: "Processing payment...",
        payment_success: "Payment successful! Thank you for your donation.",
        payment_failed: "Payment failed. Please try again.",
        invalid_video_url: "Invalid or missing video URL. Please try another video.",
        api_error: "Failed to load videos. Please check your connection or contact support."
    },
    arabic: {
        site_title: "أ. إ. أ. مقاري",
        nav_home: "الرئيسية",
        nav_audio: "الصوتيات",
        nav_videos: "الفيديوهات",
        nav_admin: "الإدارة",
        donate_btn: "ادعم الإسلام",
        language_switch: "English",
        videos_title: "مجموعة الفيديوهات",
        search_placeholder: "البحث في الفيديوهات بالعنوان...",
        loading_text: "جاري التحميل...",
        loading_videos: "جاري تحميل الفيديوهات...",
        filter_all: "جميع الفيديوهات",
        filter_youtube: "يوتيوب",
        filter_local: "فيديوهات محلية",
        watch_btn: "تشغيل",
        close_video: "إغلاق",
        footer_contact_title: "معلومات الاتصال",
        footer_email: "📧 1440shamsusabo@gmail.com",
        footer_phone: "📞 08030909793",
        footer_location: "📍 نيجيريا",
        footer_quick_links: "روابط سريعة",
        footer_home: "الرئيسية",
        footer_audio: "الصوتيات",
        footer_videos: "الفيديوهات",
        footer_admin: "الإدارة",
        footer_support_title: "ادعم عملنا",
        footer_donate: "ادعم التعليم الإسلامي",
        footer_language: "تغيير اللغة",
        developed_by: "تطوير",
        sponsored_by: "برعاية",
        donation_title: "ادعم التعليم الإسلامي والدعوة",
        donation_subtitle: "ساعدنا في نشر المعرفة الإسلامية ودعم مهمة الأستاذ مقاري التعليمية",
        paystack_loading: "جاري تحميل نظام الدفع...",
        donor_name_label: "اسم المتبرع",
        amount_label: "المبلغ (₦)",
        donor_email_label: "البريد الإلكتروني (اختياري)",
        donor_phone_label: "رقم الهاتف (اختياري)",
        cancel_text: "إلغاء",
        donate_now: "تبرع الآن - ادعم الإسلام",
        no_videos_found: "لم يتم العثور على فيديوهات تطابق بحثك.",
        processing_payment: "جاري معالجة الدفع...",
        payment_success: "تم الدفع بنجاح! شكراً لك على تبرعك.",
        payment_failed: "فشل الدفع. يرجى المحاولة مرة أخرى.",
        invalid_video_url: "رابط الفيديو غير صالح أو مفقود. يرجى تجربة فيديو آخر.",
        api_error: "فشل تحميل الفيديوهات. يرجى التحقق من الاتصال أو التواصل مع الدعم."
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...');
    initializeApp();
    loadPaystackScript();
    setupEventListeners();
    loadVideos();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.error('Lucide library not loaded!');
    }
});

function initializeApp() {
    console.log('Setting up language, styles, and scroll listener...');
    const savedLanguage = localStorage.getItem('language') || 'english';
    currentLanguage = savedLanguage;

    // Add styles to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

        body {
            font-family: 'Arial', sans-serif;
        }

        .arabic {
            font-family: 'Amiri', serif !important;
            text-align: justify;
        }

        .video-card {
            transition: transform 0.3s ease;
        }

        .video-card:hover {
            transform: translateY(-5px);
        }

        .video-thumbnail {
            width: 170px;
            height: 170px;
            object-fit: cover;
            display: block;
            margin: 0 auto;
        }

        .card-title {
            font-size: 0.7rem;
            font-weight: 400;
            line-height: 1.4;
            max-height: 2.8rem;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .card-title.arabic {
            font-size: 0.8rem;
            font-weight: 400;
            font-family: 'Amiri', serif;
        }

        .card {
            min-height: 280px;
            max-height: 280px;
            display: flex;
            flex-direction: column;
        }

        .card-body {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .btn-primary {
            background-color: #007bff;
            border-color: #007bff;
        }

        .btn-primary:hover {
            background-color: #0056b3;
            border-color: #004085;
        }

        .d-flex.gap-2 {
            gap: 0.5rem;
        }
    `;
    document.head.appendChild(styleElement);

    updateLanguage();
    window.addEventListener('scroll', handleScroll);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    } else {
        console.error('Search input not found!');
    }
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => btn.addEventListener('click', handleFilter));
    } else {
        console.warn('No filter buttons found!');
    }
    
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', scrollToTop);
    } else {
        console.error('Back to top button not found!');
    }
    
    const toggler = document.querySelector('.navbar-toggler');
    const cancel = document.querySelector('.navbar-cancel');
    const navbarNav = document.querySelector('#navbarNav');

    if (toggler && cancel && navbarNav) {
        toggler.addEventListener('click', function() {
            setTimeout(() => {
                if (navbarNav.classList.contains('show')) {
                    toggler.style.display = 'none';
                    cancel.style.display = 'block';
                }
            }, 10);
        });
        
        cancel.addEventListener('click', function() {
            toggler.style.display = 'block';
            cancel.style.display = 'none';
            if (typeof bootstrap !== 'undefined') {
                bootstrap.Collapse.getInstance(navbarNav).hide();
            } else {
                console.error('Bootstrap not loaded!');
            }
        });
        
        navbarNav.addEventListener('hidden.bs.collapse', function() {
            toggler.style.display = 'block';
            cancel.style.display = 'none';
        });
        
        navbarNav.addEventListener('shown.bs.collapse', function() {
            toggler.style.display = 'none';
            cancel.style.display = 'block';
        });
        
        const navLinks = navbarNav.querySelectorAll('.nav-link, .btn');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (navbarNav.classList.contains('show')) {
                    if (typeof bootstrap !== 'undefined') {
                        bootstrap.Collapse.getInstance(navbarNav).hide();
                    }
                }
            });
        });
    } else {
        console.error('Navbar elements missing:', { toggler, cancel, navbarNav });
    }

    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.addEventListener('hidden.bs.modal', function() {
            console.log('Video modal closed, clearing video container...');
            const videoContainer = document.getElementById('video-container');
            if (videoContainer) {
                videoContainer.innerHTML = '';
            }
            currentVideoModal = null;
        });
    } else {
        console.error('Video modal not found!');
    }
}

function loadPaystackScript() {
    console.log('Loading Paystack script...');
    if (window.PaystackPop) {
        paystackLoaded = true;
        hidePaystackLoading();
        return;
    }
    
    setTimeout(() => {
        if (window.PaystackPop) {
            paystackLoaded = true;
            hidePaystackLoading();
        } else {
            console.warn('Paystack script not loaded after timeout!');
        }
    }, 2000);
}

function hidePaystackLoading() {
    const loadingElement = document.getElementById('paystack-loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    } else {
        console.error('Paystack loading element not found!');
    }
}

async function loadVideos() {
    console.log('Fetching videos from /api/videos...');
    try {
        const response = await fetch('/api/videos');
        console.log('API response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API response data:', data);
        if (!Array.isArray(data)) {
            throw new Error('Invalid API response: Expected array');
        }
        videoFiles = data.sort((a, b) => {
            const titleA = currentLanguage === 'arabic' ? a.title_arabic : a.title_english;
            const titleB = currentLanguage === 'arabic' ? b.title_arabic : b.title_english;
            return titleA.localeCompare(titleB, currentLanguage === 'arabic' ? 'ar' : 'en');
        });
        console.log('Sorted videos:', videoFiles);
        filteredVideos = [...videoFiles];
        displayVideos();
    } catch (error) {
        console.error('Error loading videos:', error);
        alert(translations[currentLanguage].api_error);
        showNoVideos();
    } finally {
        hideLoadingSpinner();
    }
}

function displayVideos() {
    const videosGrid = document.getElementById('videos-grid');
    const noVideos = document.getElementById('no-videos');
    
    if (!videosGrid || !noVideos) {
        console.error('Grid or no-videos element missing:', { videosGrid, noVideos });
        return;
    }
    
    if (filteredVideos.length === 0) {
        console.log('No videos to display');
        showNoVideos();
        return;
    }
    
    noVideos.classList.add('d-none');
    videosGrid.innerHTML = '';
    
    let validVideos = 0;
    filteredVideos.forEach(video => {
        const ytVideoId = extractYouTubeVideoId(video.video_url);
        console.log('Processing video:', { id: video.id, title: video.title_english || video.title_arabic, video_url: video.video_url, ytVideoId });
        if (video.video_url && ytVideoId) {
            console.log('Adding video to grid:', video.title_english || video.title_arabic);
            const videoCard = createVideoCard(video);
            videosGrid.appendChild(videoCard);
            validVideos++;
        } else {
            console.warn('Skipping video with invalid or missing URL:', { id: video.id, title: video.title_english || video.title_arabic, video_url: video.video_url });
            const placeholderCard = createPlaceholderCard(video);
            videosGrid.appendChild(placeholderCard);
        }
    });
    
    if (validVideos === 0 && filteredVideos.length > 0) {
        console.log('No valid videos found, but placeholders added');
    } else if (validVideos === 0) {
        console.log('No valid videos found');
        showNoVideos();
    }
}

function createVideoCard(video) {
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-3 mb-3';
    
    const title = currentLanguage === 'arabic' ? video.title_arabic : video.title_english;
    const t = translations[currentLanguage];
    
    const ytVideoId = extractYouTubeVideoId(video.video_url);
    const thumbnail = ytVideoId ? `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg` : 'https://via.placeholder.com/170?text=No+Thumbnail';
    
    col.innerHTML = `
        <div class="card h-100 shadow-sm video-card" data-type="youtube">
            <div class="position-relative">
                <img src="${thumbnail}" alt="${title}" class="card-img-top video-thumbnail">
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-danger">
                        <i data-lucide="youtube" class="me-1" style="width: 12px; height: 12px;"></i>
                        YouTube
                    </span>
                </div>
                <div class="position-absolute top-50 start-50 translate-middle">
                    <div class="btn btn-light btn-lg rounded-circle shadow" style="width: 60px; height: 60px;">
                        <i data-lucide="play" class="text-primary"></i>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title mb-2 ${currentLanguage === 'arabic' ? 'arabic' : ''}">${title}</h5>
                <div class="d-flex justify-content-center">
                    <button class="btn btn-primary w-100" onclick="playVideo(${video.id}, '${encodeURIComponent(title)}', '${encodeURIComponent(video.video_url || '')}')">
                        <i data-lucide="play" class="me-2"></i>
                        ${t.watch_btn}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

function createPlaceholderCard(video) {
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-3 mb-3';
    
    const title = currentLanguage === 'arabic' ? video.title_arabic : video.title_english;
    const t = translations[currentLanguage];
    
    col.innerHTML = `
        <div class="card h-100 shadow-sm video-card" data-type="youtube">
            <div class="position-relative">
                <img src="https://via.placeholder.com/170?text=No+Thumbnail" alt="${title}" class="card-img-top video-thumbnail">
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge bg-danger">
                        <i data-lucide="youtube" class="me-1" style="width: 12px; height: 12px;"></i>
                        YouTube
                    </span>
                </div>
                <div class="position-absolute top-50 start-50 translate-middle">
                    <div class="btn btn-light btn-lg rounded-circle shadow" style="width: 60px; height: 60px;">
                        <i data-lucide="x" class="text-danger"></i>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title mb-2 ${currentLanguage === 'arabic' ? 'arabic' : ''}">${title}</h5>
                <div class="d-flex justify-content-center">
                    <button class="btn btn-secondary w-100" disabled>
                        <i data-lucide="play" class="me-2"></i>
                        ${t.invalid_video_url}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

function getYouTubeThumbnail(url) {
    const ytVideoId = extractYouTubeVideoId(url);
    return ytVideoId ? `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg` : 'https://via.placeholder.com/170?text=No+Thumbnail';
}

function extractYouTubeVideoId(url) {
    try {
        if (!url || typeof url !== 'string') {
            console.error('Invalid or missing YouTube URL:', url);
            return null;
        }
        const cleanUrl = url.split('?')[0];
        const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = cleanUrl.match(regExp);
        if (match && match[1].length === 11) {
            console.log('Extracted YouTube video ID:', match[1], 'from URL:', url);
            return match[1];
        }
        console.error('No valid YouTube ID found in URL:', url);
        return null;
    } catch (error) {
        console.error('Error parsing YouTube URL:', error, 'URL:', url);
        return null;
    }
}

function showNoVideos() {
    const noVideos = document.getElementById('no-videos');
    if (noVideos) {
        noVideos.textContent = translations[currentLanguage].no_videos_found;
        noVideos.classList.remove('d-none');
        document.getElementById('videos-grid').innerHTML = '';
    } else {
        console.error('No-videos element not found!');
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    } else {
        console.error('Loading spinner not found!');
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    console.log('Search term:', searchTerm);
    applyFilters(searchTerm, currentFilter);
}

function handleFilter(event) {
    const filterType = event.currentTarget.dataset.filter;
    currentFilter = filterType;
    
    console.log('Applying filter:', filterType);
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    applyFilters(searchTerm, filterType);
}

function applyFilters(searchTerm, filterType) {
    console.log('Applying filters - Search:', searchTerm, 'Type:', filterType);
    let filtered = [...videoFiles];
    
    if (searchTerm) {
        filtered = filtered.filter(video => {
            const title = currentLanguage === 'arabic' ? video.title_arabic : a.title_english;
            return title.toLowerCase().includes(searchTerm);
        });
    }
    
    if (filterType !== 'all') {
        filtered = filtered.filter(video => {
            if (filterType === 'youtube') {
                return video.video_url && video.video_url.trim() && extractYouTubeVideoId(video.video_url);
            }
            return false;
        });
    }
    
    filteredVideos = filtered;
    console.log('Filtered videos:', filteredVideos);
    displayVideos();
}

function handleScroll() {
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        if (window.pageYOffset > 300) {
            backToTop.classList.remove('d-none');
        } else {
            backToTop.classList.add('d-none');
        }
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleLanguage() {
    console.log('Toggling language to:', currentLanguage === 'english' ? 'arabic' : 'english');
    collapseNavbar();
    
    currentLanguage = currentLanguage === 'english' ? 'arabic' : 'english';
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
    
    if (videoFiles.length > 0) {
        videoFiles.sort((a, b) => {
            const titleA = currentLanguage === 'arabic' ? a.title_arabic : a.title_english;
            const titleB = currentLanguage === 'arabic' ? b.title_arabic : b.title_english;
            return titleA.localeCompare(titleB, currentLanguage === 'arabic' ? 'ar' : 'en');
        });
        
        const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
        applyFilters(searchTerm, currentFilter);
    }
}

function updateLanguage() {
    console.log('Updating UI language to:', currentLanguage);
    const t = translations[currentLanguage];
    
    document.documentElement.dir = currentLanguage === 'arabic' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage === 'arabic' ? 'ar' : 'en';
    
    const textElements = {
        'site-title': t.site_title,
        'nav-home': t.nav_home,
        'nav-audio': t.nav_audio,
        'nav-videos': t.nav_videos,
        'nav-admin-text': t.nav_admin,
        'donate-btn-text': t.donate_btn,
        'language-btn-text': t.language_switch,
        'videos-title': t.videos_title,
        'loading-text': t.loading_text,
        'loading-videos-text': t.loading_videos,
        'filter-all-text': t.filter_all,
        'filter-youtube-text': t.filter_youtube,
        'filter-local-text': t.filter_local,
        'no-videos-text': t.no_videos_found,
        'close-video-text': t.close_video,
        'footer-contact-title': t.footer_contact_title,
        'footer-email': t.footer_email,
        'footer-phone': t.footer_phone,
        'footer-location': t.footer_location,
        'footer-quick-links': t.footer_quick_links,
        'footer-home': t.footer_home,
        'footer-audio': t.footer_audio,
        'footer-videos': t.footer_videos,
        'footer-admin': t.footer_admin,
        'footer-support-title': t.footer_support_title,
        'footer-donate-text': t.footer_donate,
        'footer-language-text': t.footer_language,
        'developed-by-text': t.developed_by,
        'sponsored-by-text': t.sponsored_by,
        'donation-modal-title': t.donation_title,
        'donation-modal-subtitle': t.donation_subtitle,
        'paystack-loading-text': t.paystack_loading,
        'donor-name-label': t.donor_name_label,
        'amount-label': t.amount_label,
        'donor-email-label': t.donor_email_label,
        'donor-phone-label': t.donor_phone_label,
        'donation-message': t.donation_subtitle,
        'cancel-text': t.cancel_text,
        'donate-now-text': paymentLoading ? t.processing_payment : t.donate_now
    };
    
    Object.entries(textElements).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    });
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.placeholder = t.search_placeholder;
    } else {
        console.error('Search input not found for placeholder update!');
    }
    
    updateFormPlaceholders(t);
    
    const elementsToStyle = [
        'site-title', 'videos-title', 'search-input', 'donation-modal-title', 
        'donation-modal-subtitle', 'donation-message', 'footer-contact-title', 
        'footer-quick-links', 'footer-support-title'
    ];
    
    elementsToStyle.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (currentLanguage === 'arabic') {
                element.classList.add('arabic');
            } else {
                element.classList.remove('arabic');
            }
        } else {
            console.warn(`Style element with ID ${id} not found`);
        }
    });
    
    updateFormInputsDirection();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.error('Lucide library not loaded!');
    }
}

function updateFormPlaceholders(t) {
    const placeholders = {
        'donor-name-input': currentLanguage === 'arabic' ? 'أدخل اسمك' : 'Enter your name',
        'amount-input': currentLanguage === 'arabic' ? 'أدخل المبلغ (الحد الأدنى ₦100)' : 'Enter amount (minimum ₦100)'
    };
    
    Object.entries(placeholders).forEach(([id, placeholder]) => {
        const element = document.getElementById(id);
        if (element) {
            element.placeholder = placeholder;
        } else {
            console.warn(`Placeholder element with ID ${id} not found`);
        }
    });
}

function updateFormInputsDirection() {
    const formInputs = [
        'search-input', 'donor-name-input', 'amount-input',
        'donor-email-input', 'donor-phone-input'
    ];
    
    formInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (currentLanguage === 'arabic') {
                element.classList.add('text-end');
                element.dir = 'rtl';
            } else {
                element.classList.remove('text-end');
                element.dir = 'ltr';
            }
        } else {
            console.warn(`Input element with ID ${id} not found`);
        }
    });
}

function playVideo(videoId, encodedTitle, encodedVideoUrl) {
    console.log('Attempting to play video:', { videoId, encodedTitle, encodedVideoUrl });
    const title = decodeURIComponent(encodedTitle);
    const videoUrl = decodeURIComponent(encodedVideoUrl);

    const video = videoFiles.find(v => v.id === videoId);
    if (!video || !video.video_url) {
        console.error('Video not found or invalid URL:', videoId, videoUrl);
        alert(translations[currentLanguage].invalid_video_url);
        return;
    }

    const videoModal = document.getElementById('videoModal');
    const videoContainer = document.getElementById('video-container');
    const modalTitle = document.getElementById('video-modal-title');

    if (!videoModal || !videoContainer || !modalTitle) {
        console.error('Modal elements missing:', { videoModal, videoContainer, modalTitle });
        alert(translations[currentLanguage].invalid_video_url);
        return;
    }

    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap not loaded!');
        alert(translations[currentLanguage].invalid_video_url);
        return;
    }

    const modal = new bootstrap.Modal(videoModal, { backdrop: 'static', keyboard: false });
    
    modalTitle.textContent = title;
    videoContainer.innerHTML = '';
    
    const ytVideoId = extractYouTubeVideoId(video.video_url);
    if (ytVideoId) {
        videoContainer.innerHTML = `
            <div class="ratio ratio-16x9">
                <iframe 
                    src="https://www.youtube.com/embed/${ytVideoId}?autoplay=1&controls=1&rel=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                    allowfullscreen
                    class="w-100 h-100">
                </iframe>
            </div>
        `;
    } else {
        console.error('Invalid YouTube video ID for URL:', video.video_url);
        alert(translations[currentLanguage].invalid_video_url);
        return;
    }
    
    currentVideoModal = modal;
    modal.show();
}

function showDonationModal() {
    console.log('Opening donation modal...');
    collapseNavbar();
    const donationModal = document.getElementById('donationModal');
    if (donationModal && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(donationModal);
        modal.show();
    } else {
        console.error('Donation modal not found or Bootstrap not loaded!');
    }
}

async function handleDonation() {
    const form = document.getElementById('donation-form');
    if (!form) {
        console.error('Donation form not found!');
        return;
    }
    
    const formData = new FormData(form);
    
    const amount = formData.get('amount');
    const emailInput = formData.get('email');
    const email = emailInput && emailInput.trim() ? emailInput.trim() : '1440shamsusabo@gmail.com';
    const phone = formData.get('phone') || '08030909793';
    const donorName = formData.get('donorName') || 'Anonymous';
    
    const t = translations[currentLanguage];
    
    if (!amount || parseInt(amount) < 100) {
        alert(currentLanguage === 'arabic' ? 'يرجى إدخال مبلغ صحيح (الحد الأدنى ₦100)' : 'Please enter a valid amount (minimum ₦100)');
        return;
    }
    
    if (!paystackLoaded || !window.PaystackPop) {
        alert(currentLanguage === 'arabic' ? 'نظام الدفع غير جاهز. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.' : 'Payment system is not ready. Please check your internet connection and try again.');
        return;
    }
    
    paymentLoading = true;
    const donateBtn = document.getElementById('donate-now-btn');
    if (donateBtn) {
        donateBtn.disabled = true;
    }
    const donateText = document.getElementById('donate-now-text');
    if (donateText) {
        donateText.textContent = t.processing_payment;
    }
    
    try {
        const reference = `maqari_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const paystackConfig = {
            key: "pk_live_e6942e61f70c87019cbeb64ffed04e10fbd2ee10",
            email: email,
            amount: parseInt(amount) * 100,
            currency: 'NGN',
            ref: reference,
            metadata: {
                donor_name: donorName,
                phone: phone,
            },
            callback: function(response) {
                paymentLoading = false;
                if (donateBtn) donateBtn.disabled = false;
                if (donateText) donateText.textContent = t.donate_now;
                
                if (response.status === 'success') {
                    fetch('/api/donations/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            reference: response.reference,
                            amount: parseInt(amount),
                            donor_name: donorName,
                            email,
                            phone,
                            type: 'income',
                            description: 'Donation received via Paystack',
                        }),
                    })
                    .then(async (verifyResponse) => {
                        if (verifyResponse.ok) {
                            alert(t.payment_success);
                            const donationModal = document.getElementById('donationModal');
                            if (donationModal) {
                                bootstrap.Modal.getInstance(donationModal).hide();
                            }
                            form.reset();
                        } else {
                            alert('Payment successful but verification failed. Please contact support with reference: ' + response.reference);
                        }
                    })
                    .catch((error) => {
                        console.error('Payment verification error:', error);
                        alert('Payment successful but verification failed. Please contact support with reference: ' + response.reference);
                    });
                } else {
                    alert(t.payment_failed);
                }
            },
            onClose: function() {
                paymentLoading = false;
                if (donateBtn) donateBtn.disabled = false;
                if (donateText) donateText.textContent = t.donate_now;
            }
        };
        
        const handler = window.PaystackPop.setup(paystackConfig);
        handler.openIframe();
        
    } catch (error) {
        paymentLoading = false;
        if (donateBtn) donateBtn.disabled = false;
        if (donateText) donateText.textContent = t.donate_now;
        console.error('Payment initialization error:', error);
        alert(currentLanguage === 'arabic' ? 'فشل في تهيئة الدفع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.' : 'Failed to initialize payment. Please try again or contact support.');
    }
}

function collapseNavbar() {
    const navbarNav = document.querySelector('#navbarNav');
    if (navbarNav && navbarNav.classList.contains('show')) {
        if (typeof bootstrap !== 'undefined') {
            bootstrap.Collapse.getInstance(navbarNav).hide();
        } else {
            console.error('Bootstrap not loaded!');
        }
    }
}