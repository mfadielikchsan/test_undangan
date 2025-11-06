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

    if (window.waMsgObserver) {
        window.waMsgObserver.observe(msgDiv);
    } else {
        msgDiv.classList.add('visible');
    }

    setTimeout(() => chatContainer.scrollTop = chatContainer.scrollHeight, 100);
    inputField.value = '';

    // === AUTO REPLY BOT ===
    setTimeout(async () => {
        const typingBubble = showTypingIndicator();
        try {
            const reply = await getAIReply(text);
            chatContainer.removeChild(typingBubble); // hapus typing
            addBotMessage(reply);
        } catch (e) {
            console.error(e);
            chatContainer.removeChild(typingBubble);
            addBotMessage("Ups, terjadi kesalahan saat memproses balasan.");
        }
    }, 1200);
}


// === FUNGSI TAMBAH PESAN BOT ===
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

// === FUNGSI AI FALLBACK ===
async function getAIReply(userInput) {
    try {
        const response = await fetch("https://dark-tree-ca4b.fadielikchsan1905.workers.dev/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `
                            Kamu adalah asisten ramah yang berbicara seolah-olah kamu adalah pasangan pengantin bernama **Fadiel & Silva 💍**. 
                            Kamu sedang menjawab pesan dari tamu undangan secara online (melalui tampilan chat seperti WhatsApp). 
                            Gunakan gaya bicara yang hangat, sopan, romantis, santai, dan penuh keakraban 💚. 
                            Sapa tamu dengan namanya (${guestName}) agar terasa personal dan akrab.  
                            Jika pertanyaannya di luar konteks, arahkan kembali dengan lembut ke topik pernikahan atau undangan.

                            Berikut informasi penting tentang acara yang kamu ketahui (gunakan ini untuk menjawab pertanyaan secara alami):

                            📅 **Detail Acara:**
                            - Tanggal: Sabtu, 25 Oktober 2025
                            - Waktu: 10.00 WIB - selesai
                            - Lokasi: Gedung Serbaguna Bahagia, Jl. Mawar No. 123, Jakarta
                            - Tema: Hijau Tosca & Putih 🌿
                            - Tidak ada dresscode wajib, tapi nuansa hijau tosca cocok dengan dekorasi.
                            - Musik latar diputar selama tamu membaca undangan.
                            - Kisah Fadiel & Silva: dua insan yang dipertemukan dengan cara sederhana namun penuh makna 💞.
                            - Rekening tanda kasih: BCA 1234567890 a.n. Fadiel & Silva.
                            - Undangan online ini dibuat langsung oleh Fadiel dengan penuh cinta 💻✨.

                            Cara menjawab:
                            - Jika tamu bertanya hal seputar waktu, lokasi, pakaian, hadiah, atau ucapan, jawab berdasarkan data di atas.
                            - Jika tamu memberikan ucapan atau doa, balas dengan penuh terima kasih dan harapan baik.
                            - Jika tamu bilang hadir, sambut dengan bahagia.
                            - Jika tamu tidak bisa hadir, balas dengan ucapan terima kasih dan doa terbaik.
                            - Jika tamu bertanya hal lucu atau di luar konteks, balas dengan ringan tapi tetap sopan.

                            Jangan gunakan gaya formal seperti robot. Gunakan gaya chat seperti teman dekat atau sahabat yang sopan.
                                                    `
                    },
                    { role: "user", content: userInput }
                ]
            })
        });

        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content || "Maaf, aku belum bisa menjawab itu 😅";
        return `${aiReply}\n\n💍 Salam hangat dari Fadiel & Silva`;
    } catch (e) {
        console.error(e);
        return "Terjadi kesalahan saat menghubungi AI 😢";
    }
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

//Voice note play button
const btn = document.getElementById('vn-play');
const audio = document.getElementById('vn-audio');
const wave = document.getElementById('vn-wave');
const duration = document.getElementById('vn-duration');

// Tampilkan durasi audio
audio.addEventListener('loadedmetadata', () => {
  const secs = Math.floor(audio.duration % 60);
  duration.textContent = `0:${secs < 10 ? '0' + secs : secs}`;
});

// Fungsi toggle play/pause
btn.addEventListener('click', async () => {
  try {
    if (audio.paused) {
      await audio.play(); // play() butuh await agar aman di browser modern
      btn.textContent = '⏸'; // ubah ke pause
      wave.classList.add('playing');
    } else {
      audio.pause();
      btn.textContent = '▶'; // ubah ke play
      wave.classList.remove('playing');
    }
  } catch (err) {
    console.error('Gagal memutar audio:', err);
  }
});

// Saat audio selesai
audio.addEventListener('ended', () => {
  btn.textContent = '▶';
  wave.classList.remove('playing');
  audio.currentTime = 0; // reset ke awal (opsional)
});

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'wa-msg typing-indicator';
    typingDiv.innerHTML = `
        <img src="ASSET/ava2.png" class="wa-avatar" alt="Silva" />
        <div class="wa-bubble">
            <div class="wa-name">Silva</div>
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingDiv;
}
