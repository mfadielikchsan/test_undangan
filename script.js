// Get guest name from URL parameter
function getGuestName() {
    var url = new URL(window.location.href);
    var name = url.searchParams.get('nama') || 'tamu';
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
}

// Set greeting and tamu's name
var guestName = getGuestName();
document.getElementById('wa-greeting').textContent = `Halo ${guestName}, Anda diundang ke acara pernikahan Fadiel & Silva!`;
// Set group members in header
var groupMembers = ['Fadiel', 'Silva', guestName];
document.getElementById('wa-group-members').textContent = groupMembers.join(', ');

// Countdown logic
function updateCountdown() {
    var eventDate = new Date('2025-10-25T10:00:00+07:00');
    var now = new Date();
    var diff = eventDate - now;
    if (diff <= 0) {
        document.getElementById('wa-countdown').textContent = 'Acara telah dimulai!';
        return;
    }
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var minutes = Math.floor((diff / (1000 * 60)) % 60);
    var seconds = Math.floor((diff / 1000) % 60);
    document.getElementById('wa-countdown').textContent = `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Show chat after joining group, then play music
document.getElementById('wa-join-btn').onclick = function() {
    document.getElementById('wa-group-invite').style.display = 'none';
    document.querySelector('.wa-real-container').style.display = '';
    var bgMusic = document.getElementById('wa-bg-music');
    if(bgMusic) {
        bgMusic.volume = 0.5;
        bgMusic.play();
    }
    // Change tamu's name in chat bubble
    var tamuBubble = document.querySelector('.wa-bubble.me .wa-name');
    if(tamuBubble) tamuBubble.textContent = guestName;
    // Change join notification
    var joinNotif = document.querySelector('.wa-main > div[style*="text-align:center"]');
    if(joinNotif) joinNotif.textContent = `${guestName} joined the group`;
};
// Back button shows landing page again
document.querySelector('.wa-back').onclick = function() {
    var invite = document.getElementById('wa-group-invite');
    invite.style.display = '';
    invite.style.position = 'fixed';
    invite.style.top = '0';
    invite.style.left = '0';
    invite.style.width = '100vw';
    invite.style.height = '100vh';
    invite.style.background = '#ece5dd';
    invite.style.zIndex = '100';
    invite.style.display = 'flex';
    invite.style.alignItems = 'center';
    invite.style.justifyContent = 'center';
    // Center the child card
    var card = invite.querySelector('div[style*="max-width:340px"]');
    if(card) {
        card.style.margin = '0 auto';
    }
    document.querySelector('.wa-real-container').style.display = 'none';
    var bgMusic = document.getElementById('wa-bg-music');
    if(bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
    window.scrollTo({top: 0, behavior: 'auto'});
};
// Avatar modal
document.getElementById('wa-header-avatar').onclick = function() {
    document.getElementById('wa-modal-profile').style.display = 'flex';
};
// Call modal
document.getElementById('wa-call-btn').onclick = function() {
    document.getElementById('wa-modal-call').style.display = 'flex';
    setTimeout(function(){
        var audio = document.getElementById('wa-call-audio');
        if(audio) audio.play();
    }, 300);
};
function waCloseCall() {
    document.getElementById('wa-modal-call').style.display = 'none';
    var audio = document.getElementById('wa-call-audio');
    if(audio) {
        audio.pause();
        audio.currentTime = 0;
    }
}
// Video modal
document.getElementById('wa-video-btn').onclick = function() {
    document.getElementById('wa-modal-video').style.display = 'flex';
    var video = document.querySelector('#wa-modal-video video');
    if(video) {
        video.currentTime = 0;
        video.play();
    }
};
// Close video modal and stop video
document.querySelector('#wa-modal-video button').onclick = function() {
    document.getElementById('wa-modal-video').style.display = 'none';
    var video = document.querySelector('#wa-modal-video video');
    if(video) {
        video.pause();
        video.currentTime = 0;
    }
};

// === Chat Send Feature ===
const sendBtn = document.getElementById('wa-send-btn');
const inputField = document.getElementById('wa-input-field');
const chatContainer = document.querySelector('.wa-main');

function addUserMessage(text) {
    if (!text.trim()) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'wa-msg';
    msgDiv.style.paddingLeft = '50px';
    msgDiv.innerHTML = `
        <div class="wa-bubble me">
            <div class="wa-name">${guestName}</div>
            ${text}
            <span class="wa-time">${new Date().getHours().toString().padStart(2, '0')}.${new Date().getMinutes().toString().padStart(2, '0')} <span class="wa-check"></span></span>
        </div>
    `;
    chatContainer.appendChild(msgDiv);

    // jika observer tersedia, observe pesan baru sehingga akan animasi saat masuk view
    if (window.waMsgObserver) {
        window.waMsgObserver.observe(msgDiv);
    } else {
        // fallback: buat langsung visible
        msgDiv.classList.add('visible');
    }

    // scroll ke bawah (sedikit delay agar render selesai)
    setTimeout(() => chatContainer.scrollTop = chatContainer.scrollHeight, 100);

    inputField.value = '';

    // === AUTO REPLY BOT ===
    setTimeout(() => {
        const reply = getBotReply(text);
        if (reply) addBotMessage(reply);
    }, 1200); // delay biar kayak orang bales
}
function getBotReply(message) {
    const msg = message.toLowerCase();

    // === Balasan sesuai keyword ===
    if (/hadir|insyaallah|ikut|datang|pasti/.test(msg))
        return `Terima kasih ${guestName}! 💚 Kami sangat senang jika ${guestName} bisa hadir di hari bahagia kami 🤗`;

    if (/tidak|nggak|ga bisa|maaf|gak bisa|berhalangan|di luar kota/.test(msg))
        return `Tidak apa-apa ${guestName}, doa terbaik dari jauh pun sudah membuat kami bahagia 💚`;

    if (/selamat|barakallah|bahagia|congrats|semoga|doa/.test(msg))
        return `Aamiin, terima kasih banyak ${guestName}! 🤍 Doa dan ucapan indahmu sangat berarti untuk kami.`;

    if (/jam|pukul|waktu|kapan/.test(msg))
        return `⏰ Acara dimulai <b>Sabtu, 25 Oktober 2025 pukul 10.00 WIB</b> di Gedung Serbaguna Bahagia.`;

    if (/lokasi|tempat|alamat|gedung|maps|dimana|di mana/.test(msg))
        return `📍 Acara di <b>Gedung Serbaguna Bahagia</b>, Jl. Mawar No. 123, Jakarta.<br>
        👉 <a href="https://www.google.com/maps?q=Gedung+Serbaguna+Bahagia+Jakarta" target="_blank">Lihat Lokasi di Google Maps</a>`;

    if (/dress|tema|baju|pakaian|warna/.test(msg))
        return `✨ Tidak ada dresscode khusus, ${guestName}. Tapi kalau mau, nuansa <b>hijau tosca</b> cocok banget dengan tema dekor kami 🌿`;

    if (/amplop|rekening|hadiah|kado|transfer|qris|sumbangan/.test(msg))
        return `🎁 Terima kasih atas perhatiannya ${guestName}! Jika ingin memberikan tanda kasih, bisa melalui rekening BCA <b>1234567890 a.n. Fadiel & Silva</b> atau scan QR yang tersedia di undangan 💚`;

    if (/musik|lagu|backsound|suara/.test(msg))
        return `🎶 Musik latar sudah diputar, ${guestName}. Semoga menambah suasana hangat saat menikmati undangan kami 💕`;

    if (/fadiel|silva|pengantin|cerita|kisah/.test(msg))
        return `💍 Fadiel & Silva adalah dua insan yang dipertemukan dengan cara sederhana namun penuh makna. Semoga kisah kami menjadi doa indah juga untukmu 🤍`;

    if (/bikin|undangan online|website|buat/.test(msg))
        return `🌐 Undangan ini dibuat langsung oleh Fadiel dengan penuh cinta dan sedikit sentuhan kode 😄`;

    if (/makan|doorprize|artis|parkir|mc/.test(msg))
        return `😂 Haha, pertanyaannya seru banget ${guestName}! Datang aja ya, biar tahu jawabannya di tempat 😄`;

    if (/halo|hai|assalamu|selamat/.test(msg))
        return `Hai ${guestName}! 👋 Senang banget kamu udah mampir ke undangan kami 💚<br>
        Ketik <b>hadir</b> untuk konfirmasi, atau <b>info</b> untuk lihat detail acara ya! 😊`;

    if (/info|acara|detail/.test(msg))
        return `📅 <b>Detail Acara:</b><br>
        <div>📆 <b>Tanggal:</b> Sabtu, 25 Oktober 2025</div>
        <div>🕙 <b>Waktu:</b> 10.00 WIB - selesai</div>
        <div>📍 <b>Lokasi:</b> Gedung Serbaguna Bahagia, Jl. Mawar No. 123, Jakarta</div>
        <div>🎨 <b>Tema:</b> Hijau Tosca & Putih 🌿</div>`;

    if (/bantuan|help|faq|pertanyaan/.test(msg))
        return `💬 Berikut beberapa hal yang bisa ${guestName} tanyakan:<br><br>
        <div>• <b>hadir</b> → konfirmasi kehadiran</div>
        <div>• <b>tidak hadir</b> → berhalangan hadir</div>
        <div>• <b>lokasi</b> → lihat tempat acara</div>
        <div>• <b>waktu</b> → lihat jadwal acara</div>
        <div>• <b>tema</b> → tahu warna pakaian</div>
        <div>• <b>hadiah</b> → info rekening & QR</div>
        <div>• <b>musik</b> → putar musik latar</div>
        <div>• <b>cerita</b> → tahu tentang Fadiel & Silva</div>
        <div>• <b>website</b> → info siapa yang membuat undangan</div><br>
        Ketik salah satu kata di atas aja, nanti aku jawab otomatis 💚`;

    // === Fallback Default (pesan di luar konteks) ===
    return `Terima kasih ${guestName}! 😊<br>
    Sepertinya aku belum paham maksud pesannya nih 😅<br><br>
    Tapi ${guestName} bisa coba ketik salah satu dari daftar ini, nanti aku bantu jawab otomatis ya 💚<br><br>
    📌 <b>Beberapa hal yang sering ditanyakan:</b><br><br>
    <div>• <b>hadir</b> → untuk konfirmasi kehadiran</div>
    <div>• <b>tidak hadir</b> → kalau berhalangan hadir</div>
    <div>• <b>lokasi</b> → untuk lihat tempat acara & link Google Maps</div>
    <div>• <b>waktu</b> → untuk tahu jadwal lengkap acaranya</div>
    <div>• <b>tema</b> → untuk tahu warna & gaya pakaian</div>
    <div>• <b>hadiah</b> → untuk info rekening & QR kado digital</div>
    <div>• <b>musik</b> → untuk putar musik latar undangan 🎶</div>
    <div>• <b>cerita</b> → untuk tahu sedikit tentang Fadiel & Silva 💍</div>
    <div>• <b>website</b> → kalau mau tahu siapa yang membuat undangan 😄</div>
    <div>• <b>bantuan</b> → untuk lihat daftar lengkap pertanyaan yang bisa dijawab</div><br>
    Kalau ${guestName} masih bingung, ketik aja <b>bantuan</b> — nanti aku bantu arahkan ✨`;
}

// Fungsi untuk menambahkan bubble bot
function addBotMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'wa-msg';
    msgDiv.innerHTML = `
        <img src="ASSET/ava2.png" class="wa-avatar" alt="Silva" />
        <div>
            <div class="wa-bubble">
                <div class="wa-name">Silva</div>
                ${text}
                <span class="wa-time">${new Date().getHours().toString().padStart(2, '0')}.${new Date().getMinutes().toString().padStart(2, '0')} <span class="wa-check"></span></span>
            </div>
        </div>
    `;
    chatContainer.appendChild(msgDiv);
    msgDiv.classList.add('visible');
    setTimeout(() => chatContainer.scrollTop = chatContainer.scrollHeight, 200);
}
sendBtn.onclick = function() {
    addUserMessage(inputField.value);
};
// Tekan Enter untuk kirim
inputField.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addUserMessage(inputField.value);
    }
});

(function(){
    const chatRoot = document.querySelector('.wa-main'); // scroll container
    if (!chatRoot) return;

    // ambil semua message yang sudah ada
    const messages = Array.from(chatRoot.querySelectorAll('.wa-msg'));

    const observerOptions = {
        root: chatRoot,                 // gunakan container yang discroll
        rootMargin: '0px 0px -8% 0px',  // tweak: trigger sedikit sebelum elemen benar2 penuh terlihat
        threshold: 0.06                 // kecil cukup: saat 6% elemen terlihat
    };

    const io = new IntersectionObserver((entries) => {
        // filter yang baru masuk dan belum visible, lalu sort dari atas ke bawah
        const entering = entries
        .filter(e => e.isIntersecting && !e.target.classList.contains('visible'))
        .sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);

        entering.forEach((entry, idx) => {
            const el = entry.target;
            const alreadyInView = entry.intersectionRatio > 0.8; // hampir penuh di viewport
            const baseDelay = alreadyInView ? (idx * 120) + 400 : idx * 80; 
            // kalau sudah kelihatan saat awal, tunda sedikit biar tetap animasi

            el.style.setProperty('--delay', `${baseDelay}ms`);
            setTimeout(() => {
                el.classList.add('visible');
                io.unobserve(el);
            }, baseDelay + 20);
        });

    }, observerOptions);

    // observe semua pesan awal
    messages.forEach(m => io.observe(m));

    // expose observer supaya addUserMessage bisa mendaftarkan pesan baru
    window.waMsgObserver = io;
    }
)();

window.addEventListener('load', () => {
    // Semua gambar, iframe, dan resource sudah dimuat
    const loading = document.getElementById('loading-screen');
    const openBtn = document.getElementById('open-invitation-btn');

    // Hilangkan layar loading dengan fade out
    loading.style.opacity = '0';
    setTimeout(() => {
        loading.style.display = 'none';

        // Tampilkan tombol "Buka Undangan"
        if (openBtn) {
        openBtn.classList.add('ready');
        }

        // Optional: trigger animasi bubble pertama setelah sedikit delay
        const firstMsgs = document.querySelectorAll('.wa-msg');
        firstMsgs.forEach((msg, i) => {
        setTimeout(() => msg.classList.add('visible'), i * 100 + 300);
        });
    }, 600);
});