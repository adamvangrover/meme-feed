class MemeApp {
    constructor() {
        this.feed = document.getElementById("feed");
        this.savedFeed = document.getElementById("saved-feed");
        this.loadingIndicator = document.querySelector(".loading");
        this.errorMessage = document.querySelector(".error-message");
        this.feedContainer = document.getElementById("feed-container");
        this.savedContainer = document.getElementById("saved-container");
        this.personalitiesContainer = document.getElementById("personalities-container");
        this.personalitiesFeed = document.getElementById("personalities-feed");

        this.state = {
            memes: [],
            savedMemes: [],
            importedPersonalities: [],
            preferences: {
                darkMode: true,
                source: 'all',
                muted: false
            },
            engagement: {},
            pagination: {
                redditAfter: null,
                giphyOffset: 0
            },
            view: 'feed', // 'feed' or 'saved' or 'personalities'
            networkUsers: [],
            currentUser: {
                id: 'user_me',
                name: 'You',
                image: 'https://i.pravatar.cc/150?img=3', // Placeholder avatar
                isMe: true
            },
            renderedMemes: [], // Track memes currently in the feed for simulation
            userStats: {
                level: 1,
                xp: 0,
                memesViewed: 0,
                memesLiked: 0,
                commentsPosted: 0,
                memesCreated: 0,
                badges: []
            },
            notifications: []
        };

        this.badgesList = [
            { id: 'newbie', icon: '👶', name: 'Newbie', desc: 'Viewed 10 Memes', req: (s) => s.memesViewed >= 10 },
            { id: 'addict', icon: '🧟', name: 'Meme Addict', desc: 'Viewed 100 Memes', req: (s) => s.memesViewed >= 100 },
            { id: 'critic', icon: '🧐', name: 'Critic', desc: 'Liked 20 Memes', req: (s) => s.memesLiked >= 20 },
            { id: 'artist', icon: '🎨', name: 'Meme Artist', desc: 'Created 1 Meme', req: (s) => s.memesCreated >= 1 },
            { id: 'chatter', icon: '🗣️', name: 'Chatterbox', desc: 'Posted 5 Comments', req: (s) => s.commentsPosted >= 5 },
            { id: 'legend', icon: '👑', name: 'Legend', desc: 'Reach Level 10', req: (s) => s.level >= 10 }
        ];

        this.captions = [
            "Me realizing I've been scrolling memes for 5 hours 😭",
            "POV: You just saw the funniest meme of your life 💀",
            "When your WiFi dies and you have to face reality 😱",
            "That one friend who sends 50 memes at once 😂",
            "Every cat at 3 AM: *Chaos noises*",
            "Nobody: Me at 2 AM watching conspiracy videos 👀",
            "When you see a meme so good you ascend to another plane of existence 🔥",
            "The internet is undefeated at making me laugh 🤡",
            "Me: One more meme before bed. Also me at 3 AM: 🤣🤣🤣",
            "That one coworker who sends memes instead of working 👀",
            "Your FBI agent watching you laugh at memes all day 🕵️",
            "When you send a meme and they reply with 'seen' 💀",
            "Twitter drama in one meme: 🤡🔥👀",
            "That moment when you realize you forgot to do your assignment 😱",
            "My brain at 2 AM: What if pigeons are actually government spies? 🤔",
            "Memes > Therapy. Change my mind. 🤷",
            "Boomers: 'Memes aren’t funny.' Millennials & Gen Z: *laughing uncontrollably*",
            "This meme is scientifically proven to increase happiness. Trust me bro. 🧪",
            "Me: Laughs at my own meme. Also me: I'm hilarious. 🤣",
            "When you find a meme that perfectly describes your life 👌",
            "Trying to adult but failing miserably like... 😅",
            "My face when someone says they don't like memes 🤨",
            "Is it Friday yet? Asking for a friend... and myself. 😴",
            "When the coffee finally kicks in 🚀",
            "Brain cells during an exam: *dial-up noises*",
            "This meme is so relatable it hurts 🤕",
            "Me trying to stay positive in 2023 like... 😬",
            "When your pet does something meme-worthy 📸",
            "That feeling when you get the joke three days later 🤦‍♂️",
            "My bank account looking at me after I buy one (1) thing 📉",
            "Expectation vs. Reality: Meme Edition 😂",
            "When someone tells you a spoiler 😠",
            "The 'I'm fine' starter pack 😅",
            "Accidentally opening the front camera like... 🤳",
            "If 2023 was a meme, it would be this one 🤦‍♀️",
            "Tag a friend who would do this 😂",
            "Trying to keep it together... but the memes are too strong 💪",
            "My last two brain cells fighting for dominance 🧠💥",
            "Send this to your crush with no context 😏",
            "When your code compiles without errors... 🤯",
            "Waiting for the weekend like... ⏳",
        ];

        this.stickers = ["🔥", "😂", "💀", "🤡", "😱", "🎉", "🥶", "👀", "💯", "🤔", "🤣", "👍", "❤️", "✨", "🚀"];

        this.sounds = {
            pop: new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3'), // Simple pop
            success: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3') // Success chime
        };
        // Lower volume
        this.sounds.pop.volume = 0.2;
        this.sounds.success.volume = 0.2;

        this.init();
    }

    init() {
        this.loadState();
        this.applyTheme();
        this.setupEventListeners();

        // Load network users
        this.fetchNetworkUsers().then(() => {
             // Restore source selection
            document.getElementById('source-filter').value = this.state.preferences.source || 'all';

            if (this.state.view === 'feed') {
                this.fetchMemes().then(() => this.renderFeed(5));
            } else {
                this.switchView('saved');
            }

            this.startNetworkSimulation();
        });
    }

    loadState() {
        const saved = localStorage.getItem('memeAppState');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state.savedMemes = parsed.savedMemes || [];
            this.state.importedPersonalities = parsed.importedPersonalities || [];
            this.state.preferences = { ...this.state.preferences, ...parsed.preferences };
            this.state.engagement = parsed.engagement || {};
            if(parsed.currentUser) this.state.currentUser = parsed.currentUser;
            if(parsed.userStats) this.state.userStats = { ...this.state.userStats, ...parsed.userStats };
            if(parsed.notifications) this.state.notifications = parsed.notifications;
            // Don't restore view state, always start at feed or last usage logic can be debated.
        }
    }

    saveState() {
        const stateToSave = {
            savedMemes: this.state.savedMemes,
            importedPersonalities: this.state.importedPersonalities,
            preferences: this.state.preferences,
            engagement: this.state.engagement,
            currentUser: this.state.currentUser,
            userStats: this.state.userStats,
            notifications: this.state.notifications
        };
        localStorage.setItem('memeAppState', JSON.stringify(stateToSave));
    }

    async fetchNetworkUsers() {
        try {
            const response = await fetch('personalities.json');
            const data = await response.json();
            this.state.networkUsers = data;
        } catch (e) {
            console.error("Failed to load network users", e);
            // Fallback users
            this.state.networkUsers = [
                { id: 'p1', name: 'Doge', image: 'https://i.imgflip.com/4t0m5.jpg' },
                { id: 'p2', name: 'Grumpy Cat', image: 'https://i.imgflip.com/8p0a.jpg' }
            ];
        }
        this.renderStories();
    }

    generateFakePostData(meme) {
        // Assign a random author
        const author = this.getRandomItem(this.state.networkUsers);

        // Generate random stats
        const views = Math.floor(Math.random() * 5000) + 100;
        const likes = Math.floor(views * (Math.random() * 0.1 + 0.05)); // 5-15% likes
        const commentsCount = Math.floor(likes * (Math.random() * 0.2)); // 0-20% comments

        // Random timestamp (within last 24 hours)
        const now = new Date();
        const past = new Date(now.getTime() - Math.floor(Math.random() * 24 * 60 * 60 * 1000));

        return {
            ...meme,
            id: meme.id || `meme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            author: author,
            timestamp: past.toISOString(),
            stats: {
                views: views,
                likes: likes,
                shares: Math.floor(likes * 0.1),
                comments: commentsCount
            },
            comments: [] // We can populate this lazily or here
        };
    }

    setupEventListeners() {
        window.addEventListener("scroll", () => {
            if (this.state.view === 'feed' && window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
                this.renderFeed(5);
            }
            this.toggleScrollToTopBtn();
        });

        window.addEventListener("keydown", (e) => this.handleKeydown(e));

        // Use IntersectionObserver for active meme tracking
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Find the index of the intersecting meme
                    const children = Array.from(this.feed.children);
                    const index = children.indexOf(entry.target);
                    if (index !== -1) {
                        this.activeMemeIndex = index;
                        this.trackAction('view');
                    }
                }
            });
        }, { threshold: 0.5 });
    }

    toggleScrollToTopBtn() {
        const btn = document.getElementById('scroll-to-top');
        if (window.scrollY > 300) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    }

    handleKeydown(e) {
        if (e.target.tagName === 'INPUT' || e.target.isContentEditable) return;

        switch(e.key) {
            case 'j':
            case 'ArrowDown':
                this.scrollToNextMeme();
                break;
            case 'k':
            case 'ArrowUp':
                this.scrollToPrevMeme();
                break;
            case 'l':
                this.likeActiveMeme();
                break;
            case 's':
                this.saveActiveMeme();
                break;
            case 'm':
                this.toggleMute();
                break;
        }
    }


    scrollToNextMeme() {
        const memes = document.querySelectorAll('.meme');
        if (this.activeMemeIndex < memes.length - 1) {
            memes[this.activeMemeIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    scrollToPrevMeme() {
        const memes = document.querySelectorAll('.meme');
        if (this.activeMemeIndex > 0) {
            memes[this.activeMemeIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    likeActiveMeme() {
        const memes = document.querySelectorAll('.meme');
        if (this.activeMemeIndex >= 0 && memes[this.activeMemeIndex]) {
            const meme = memes[this.activeMemeIndex];
            const img = meme.querySelector('img');
            // Assuming url is in src, or we can look up in state.
            // Easier to trigger the like button click.
            const likeBtn = meme.querySelector("button[onclick*='❤️']");
            // The reaction buttons are using characters directly in onclick.
            // Let's find the specific button: <button onclick="app.react('${meme.url}', '❤️')">
            // Actually, we can just call app.react if we extract the URL.
            // But triggering click gives visual feedback.
            // Let's try to find the button with '🔥' or '❤️' (wait, double click is heart, reaction bar has heart?? No, reaction bar has 😂🔥🤡💀)
            // Double click is heart. Reaction bar doesn't have heart in the HTML I saw earlier...
            // Wait, looking at createMemeCard:
            // ondblclick="app.react('${meme.url}', '❤️')"
            // Reaction bar: 😂, 🔥, 💀, 🤡.
            // So 'l' should probably trigger '🔥' or we can add '❤️' to the bar or just trigger the internal react.
            // Let's trigger '🔥' as "Like".
            const fireBtn = meme.querySelector(".reaction-bar button:nth-child(2)"); // 🔥 is 2nd
            if(fireBtn) fireBtn.click();
        }
    }

    saveActiveMeme() {
        const memes = document.querySelectorAll('.meme');
        if (this.activeMemeIndex >= 0 && memes[this.activeMemeIndex]) {
            const meme = memes[this.activeMemeIndex];
            const saveBtn = meme.querySelector(".reaction-bar button[title='Save']");
            if(saveBtn) saveBtn.click();
        }
    }

    toggleMute() {
         this.state.preferences.muted = !this.state.preferences.muted;
         this.saveState();
         this.showToast(this.state.preferences.muted ? "Muted 🔇" : "Unmuted 🔊");
    }

    showToast(message) {
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.style.position = 'fixed';
            toast.style.bottom = '100px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'rgba(0,0,0,0.8)';
            toast.style.color = 'white';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '20px';
            toast.style.zIndex = '2000';
            toast.style.transition = 'opacity 0.3s';
            document.body.appendChild(toast);
        }
        toast.innerText = message;
        toast.style.opacity = '1';
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    }

    setSource(source) {
        this.state.preferences.source = source;
        this.state.memes = []; // Clear current pool
        this.feed.innerHTML = ''; // Clear display
        this.saveState();
        this.fetchMemes().then(() => this.renderFeed(5));
    }

    switchView(viewName) {
        this.state.view = viewName;
        document.getElementById('btn-feed').classList.toggle('active', viewName === 'feed');
        document.getElementById('btn-saved').classList.toggle('active', viewName === 'saved');
        document.getElementById('btn-personalities').classList.toggle('active', viewName === 'personalities');
        document.getElementById('btn-profile').classList.toggle('active', viewName === 'profile');

        this.feedContainer.classList.add('hidden');
        this.savedContainer.classList.add('hidden');
        this.personalitiesContainer.classList.add('hidden');
        document.getElementById('profile-container').classList.add('hidden');

        if (viewName === 'feed') {
            this.feedContainer.classList.remove('hidden');
            if (this.feed.children.length === 0) this.renderFeed(5);
        } else if (viewName === 'saved') {
            this.savedContainer.classList.remove('hidden');
            this.renderSavedMemes();
        } else if (viewName === 'personalities') {
            this.personalitiesContainer.classList.remove('hidden');
            this.renderPersonalities();
        } else if (viewName === 'profile') {
            document.getElementById('profile-container').classList.remove('hidden');
            this.renderProfile();
        }
    }

    async fetchMemes() {
        this.loadingIndicator.style.display = "block";
        this.errorMessage.style.display = "none";

        const newMemes = [];
        const source = this.state.preferences.source;

        try {
            // Imgflip (Only fetch once or sparingly as they don't paginate well)
            if ((source === 'all' || source === 'imgflip') && this.state.memes.filter(m => m.source === 'imgflip').length < 10) {
                try {
                    const imgflipResponse = await fetch("https://api.imgflip.com/get_memes");
                    const imgflipData = await imgflipResponse.json();
                    if (imgflipData.success) {
                        imgflipData.data.memes.forEach(m => {
                           newMemes.push({ url: m.url, source: 'imgflip', width: m.width, height: m.height });
                        });
                    }
                } catch (e) { console.error("Imgflip error", e); }
            }

            // Reddit
            if (source === 'all' || source === 'reddit') {
                try {
                    const after = this.state.pagination.redditAfter ? `&after=${this.state.pagination.redditAfter}` : '';
                    const redditResponse = await fetch(`https://www.reddit.com/r/memes/hot.json?limit=25${after}`);
                    const redditData = await redditResponse.json();

                    this.state.pagination.redditAfter = redditData.data.after;

                    redditData.data.children.forEach(post => {
                        if (post.data.url && (post.data.url.endsWith(".jpg") || post.data.url.endsWith(".png") || post.data.url.endsWith(".gif"))) {
                            newMemes.push({ url: post.data.url, source: 'reddit', title: post.data.title });
                        }
                    });
                } catch (e) { console.error("Reddit error", e); }
            }

            // Giphy
            if (source === 'all' || source === 'giphy') {
                try {
                    const giphyApiKey = "dc6zaTOxFJmzC";
                    const offset = this.state.pagination.giphyOffset;
                    const giphyResponse = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${giphyApiKey}&limit=10&rating=pg-13&offset=${offset}`);
                    const giphyData = await giphyResponse.json();

                    this.state.pagination.giphyOffset += 10;

                    giphyData.data.forEach(gif => {
                        if(gif.images && gif.images.downsized_medium) {
                             newMemes.push({ url: gif.images.downsized_medium.url, source: 'giphy', title: gif.title });
                        }
                    });
                } catch (e) { console.error("Giphy error", e); }
            }

            // Shuffle and add to pool
            const socialMemes = newMemes.map(m => this.generateFakePostData(m));
            this.state.memes = [...this.state.memes, ...this.shuffleArray(socialMemes)];

        } catch (error) {
            console.error("Global fetch error:", error);
            this.errorMessage.style.display = "block";
        } finally {
            this.loadingIndicator.style.display = "none";
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    renderFeed(count) {
        if (this.state.memes.length < count) {
            this.fetchMemes().then(() => this.renderFeed(count));
            return;
        }

        for (let i = 0; i < count; i++) {
            if (this.state.memes.length === 0) break;
            const meme = this.state.memes.shift();
            this.state.renderedMemes.push(meme); // Track for simulation
            this.createMemeCard(meme, this.feed);
        }
    }

    renderSavedMemes() {
        this.savedFeed.innerHTML = '';
        if (this.state.savedMemes.length === 0) {
            document.getElementById('no-saved-msg').style.display = 'block';
            return;
        } else {
            document.getElementById('no-saved-msg').style.display = 'none';
        }

        // Render in reverse order (newest first)
        [...this.state.savedMemes].reverse().forEach(meme => {
            this.createMemeCard(meme, this.savedFeed, true);
        });
    }

    renderPersonalities() {
        this.personalitiesFeed.innerHTML = '';
        if (this.state.importedPersonalities.length === 0) {
            document.getElementById('no-personalities-msg').style.display = 'block';
            return;
        } else {
            document.getElementById('no-personalities-msg').style.display = 'none';
        }

        this.state.importedPersonalities.forEach(p => {
            const card = document.createElement('div');
            card.className = 'personality-card';
            card.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <button class="remove-personality-btn" onclick="app.removePersonality('${p.id}')"><i class="fas fa-times"></i></button>
                <div class="personality-info">
                    <div class="personality-name">${p.name}</div>
                    <div class="personality-text">"${p.text}"</div>
                    <button class="nav-btn" onclick="app.speakPersonality('${p.id}')"><i class="fas fa-volume-up"></i> Speak</button>
                </div>
            `;
            this.personalitiesFeed.appendChild(card);
        });
    }

    removePersonality(id) {
        this.state.importedPersonalities = this.state.importedPersonalities.filter(p => p.id !== id);
        this.saveState();
        this.renderPersonalities();
    }

    speakPersonality(id) {
        const p = this.state.importedPersonalities.find(item => item.id === id);
        if (p) {
            const utterance = new SpeechSynthesisUtterance(p.text);
            if(p.voice) {
                utterance.pitch = p.voice.pitch || 1;
                utterance.rate = p.voice.rate || 1;
                // Language selection is more complex as it depends on available voices, but we can try
                if(p.voice.lang) utterance.lang = p.voice.lang;
            }
            speechSynthesis.speak(utterance);
        }
    }

    createMemeCard(meme, container, isSaved = false) {
        const memeDiv = document.createElement("div");
        memeDiv.className = "meme";
        if(meme.id) memeDiv.id = meme.id;

        // Observe this meme if it's in the feed
        if (!isSaved && this.observer) {
            this.observer.observe(memeDiv);
        }

        // Default values for robustness
        const captionText = meme.caption || meme.title || this.getRandomItem(this.captions);
        const overlayText = isSaved ? '' : `<div class="overlay">${this.getRandomItem(this.stickers)}</div>`;

        // Social Data Handlers
        const author = meme.author || { name: 'Anonymous', image: 'https://i.pravatar.cc/150?u=anon' };
        const timeString = this.timeAgo(meme.timestamp || new Date());

        // Stats
        const stats = meme.stats || { views: 0, likes: 0, comments: 0, shares: 0 };

        // Check if saved to highlight save button
        const isAlreadySaved = this.state.savedMemes.some(m => m.url === meme.url);
        const saveBtnClass = isAlreadySaved ? "fas fa-bookmark" : "far fa-bookmark";
        const saveBtnColor = isAlreadySaved ? "color: #ff4b2b" : "";

        // Remove button for saved view
        const removeBtn = isSaved ? `<button onclick="app.removeSaved('${meme.url}')" title="Remove"><i class="fas fa-trash"></i></button>` : '';
        const saveBtn = !isSaved ? `<button onclick="app.saveMeme('${meme.url}', this.closest('.meme').querySelector('.caption').innerText, this)" title="Save"><i class="${saveBtnClass}" style="${saveBtnColor}"></i></button>` : '';

        // Comments HTML
        let commentsHtml = '';
        if(meme.comments && meme.comments.length > 0) {
            meme.comments.slice(0, 2).forEach(c => {
                commentsHtml += `
                    <div class="comment">
                        <img src="${c.author.image}" class="comment-avatar">
                        <div class="comment-content">
                            <div class="comment-author">${c.author.name}</div>
                            <div class="comment-text">${c.text}</div>
                        </div>
                    </div>
                `;
            });
            if(meme.comments.length > 2) {
                commentsHtml += `<div style="font-size:0.8rem; color:#888; text-align:left; margin-bottom:10px; cursor:pointer;">View all ${meme.comments.length} comments</div>`;
            }
        }

        memeDiv.innerHTML = `
            <div class="post-header">
                <img src="${author.image}" class="post-avatar">
                <div class="post-meta">
                    <span class="post-author">${author.name}</span>
                    <span class="post-time">${timeString}</span>
                </div>
            </div>

            <img src="${meme.url}" alt="Meme" loading="lazy" ondblclick="app.react('${meme.url}', '❤️')">
            ${overlayText}

            <div class="caption" contenteditable="${!isSaved}" spellcheck="false">${captionText}</div>

            <div class="post-stats">
                <span class="stat-views">${stats.views} Views</span>
                <span>${stats.likes} Likes • ${stats.comments} Comments • ${stats.shares} Shares</span>
            </div>

            <div class="reaction-bar">
                <button onclick="app.react('${meme.url}', '😂')">😂</button>
                <button onclick="app.react('${meme.url}', '🔥')">🔥</button>
                <button onclick="app.react('${meme.url}', '💀')">💀</button>
                <button onclick="app.react('${meme.url}', '🤡')">🤡</button>
                <button onclick="app.toggleComments('${memeDiv.id}')" title="Comment"><i class="far fa-comment"></i></button>
                <button onclick="app.shareMeme('${meme.url}')" title="Share"><i class="fas fa-share-alt"></i></button>
                <button onclick="app.speakCaption(this.closest('.meme').querySelector('.caption').innerText)" title="Speak"><i class="fas fa-volume-up"></i></button>
                ${saveBtn}
                ${removeBtn}
            </div>

            <div class="comments-section ${meme.comments && meme.comments.length > 0 ? '' : 'hidden'}" id="comments-${memeDiv.id}">
                <div class="comments-list">
                    ${commentsHtml}
                </div>
                <div class="comment-input-area">
                    <img src="${this.state.currentUser.image}" class="comment-avatar">
                    <input type="text" class="comment-input" placeholder="Write a comment..." onkeydown="if(event.key === 'Enter') app.postComment('${memeDiv.id}', this)">
                    <button class="comment-submit-btn" onclick="app.postComment('${memeDiv.id}', this.previousElementSibling)"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;

        container.appendChild(memeDiv);
    }

    timeAgo(dateParam) {
        if (!dateParam) return null;
        const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
        const today = new Date();
        const seconds = Math.round((today - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return 'Just now';
        else if (minutes < 60) return `${minutes}m ago`;
        else if (hours < 24) return `${hours}h ago`;
        else return `${days}d ago`;
    }

    toggleComments(memeId) {
        const section = document.querySelector(`#comments-${memeId}`);
        if(section) section.classList.toggle('hidden');
    }

    postComment(memeId, inputElement) {
        const text = inputElement.value.trim();
        if (!text) return;

        const meme = this.state.memes.find(m => m.id === memeId) ||
                     this.state.renderedMemes.find(m => m.id === memeId) ||
                     this.state.savedMemes.find(m => m.id === memeId);

        if (meme) {
            const newComment = {
                id: `c_${Date.now()}`,
                author: this.state.currentUser,
                text: text,
                timestamp: new Date().toISOString()
            };

            if(!meme.comments) meme.comments = [];
            meme.comments.push(newComment);

            // Update stats
            if(!meme.stats) meme.stats = { views:0, likes:0, comments:0, shares:0 };
            meme.stats.comments += 1;

            // Update UI
            this.addCommentToDOM(memeId, newComment);
            this.updateStatsDOM(memeId, meme.stats);

            this.trackAction('comment');

            // Clear input
            inputElement.value = '';

            // Save state if it's a saved meme (if it's in feed, it's transient unless we save feed state, which we don't fully do yet for infinite scroll)
            // But we can update engagement state if we want to track it there.
            // For now, let's just save state if it's in savedMemes.
             const isSaved = this.state.savedMemes.some(m => m.id === memeId);
             if(isSaved) this.saveState();

        } else {
             console.error("Meme not found for comment:", memeId);
        }
    }

    addCommentToDOM(memeId, comment) {
        const list = document.querySelector(`#comments-${memeId} .comments-list`);
        if (list) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `
                <img src="${comment.author.image}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-author">${comment.author.name}</div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            `;
            list.appendChild(commentDiv);

            // Ensure section is visible
            const section = document.querySelector(`#comments-${memeId}`);
            if(section) section.classList.remove('hidden');
        }
    }

    updateStatsDOM(memeId, stats) {
        const memeEl = document.getElementById(memeId);
        if(memeEl) {
             const viewsEl = memeEl.querySelector('.stat-views');
             if(viewsEl) viewsEl.innerText = `${stats.views} Views`;

             const statsEl = memeEl.querySelector('.post-stats span:nth-child(2)');
             if(statsEl) {
                 statsEl.innerHTML = `${stats.likes} Likes • ${stats.comments} Comments • ${stats.shares} Shares`;
             }
        }
    }

    react(memeUrl, reaction) {
        this.trackEngagement(memeUrl, reaction);
        if(reaction === '🔥' || reaction === '❤️' || reaction === '😂') {
            this.trackAction('like');
        }
        // Visual feedback
        const btn = event.target.closest('button') || event.target;
        if(btn) {
            btn.classList.add("reacted");
            setTimeout(() => btn.classList.remove("reacted"), 300);
        }
        this.playSound('pop');
    }

    trackEngagement(memeUrl, reaction = null) {
        if (!this.state.engagement[memeUrl]) {
            this.state.engagement[memeUrl] = { views: 0, reactions: {} };
        }
        this.state.engagement[memeUrl].views += 1;
        if (reaction) {
            if (!this.state.engagement[memeUrl].reactions[reaction]) {
                this.state.engagement[memeUrl].reactions[reaction] = 0;
            }
            this.state.engagement[memeUrl].reactions[reaction] += 1;
        }
        this.saveState();
    }

    async shareMeme(memeUrl) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this meme!',
                    url: memeUrl
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(memeUrl).then(() => {
                alert("Meme URL copied to clipboard!");
            });
        }
    }

    saveMeme(memeUrl, caption, btnElement) {
        const isAlreadySaved = this.state.savedMemes.some(m => m.url === memeUrl);
        if (!isAlreadySaved) {
            this.state.savedMemes.push({ url: memeUrl, caption: caption, date: new Date().toISOString() });
            this.saveState();
            this.playSound('success');

            // Update Icon
            if(btnElement) {
                const icon = btnElement.querySelector('i');
                icon.className = "fas fa-bookmark";
                icon.style.color = "#ff4b2b";
            }
        } else {
            // Optional: Unsave
            // alert("Already saved!");
        }
    }

    removeSaved(memeUrl) {
        this.state.savedMemes = this.state.savedMemes.filter(m => m.url !== memeUrl);
        this.saveState();
        this.renderSavedMemes();
    }

    speakCaption(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        speechSynthesis.speak(utterance);
    }

    startNetworkSimulation() {
        setInterval(() => {
            if (this.state.renderedMemes.length === 0) return;

            // 1. Simulate Views (happens frequently)
            this.state.renderedMemes.forEach(meme => {
                if(Math.random() > 0.3) {
                    meme.stats.views += Math.floor(Math.random() * 5);
                    this.updateStatsDOM(meme.id, meme.stats);
                }
            });

            // 2. Simulate Likes/Shares (less frequent)
            this.state.renderedMemes.forEach(meme => {
                if(Math.random() > 0.8) { // 20% chance per tick
                     meme.stats.likes += 1;
                     if(Math.random() > 0.7) meme.stats.shares += 1;
                     this.updateStatsDOM(meme.id, meme.stats);
                }
            });

            // 3. Simulate Comments (rare)
            if(Math.random() > 0.85) { // 15% chance per tick to add a comment somewhere
                const randomMeme = this.getRandomItem(this.state.renderedMemes);
                const randomUser = this.getRandomItem(this.state.networkUsers);
                const randomComment = this.getRandomItem([
                    "LOL 😂", "I can't breathe 💀", "This is so true", "Delete this",
                    "Sent to my mom", "Literally me", "Who did this? 🤣", "Underrated",
                    "Take my upvote", "👀", "🔥", "Wait what?", "Classic"
                ]);

                if(randomMeme && randomUser) {
                    const newComment = {
                        id: `c_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
                        author: randomUser,
                        text: randomComment,
                        timestamp: new Date().toISOString()
                    };

                    if(!randomMeme.comments) randomMeme.comments = [];
                    randomMeme.comments.push(newComment);
                    randomMeme.stats.comments += 1;

                    this.addCommentToDOM(randomMeme.id, newComment);
                    this.updateStatsDOM(randomMeme.id, randomMeme.stats);
                }
            }

            // 4. Simulate Notifications (rare)
            if(Math.random() > 0.95) { // 5% chance
                const randomUser = this.getRandomItem(this.state.networkUsers);
                if (randomUser) {
                    const events = [
                        "liked your meme",
                        "commented on your post",
                        "started following you",
                        "shared your meme"
                    ];
                    const event = this.getRandomItem(events);
                    this.addNotification(`${randomUser.name} ${event}`, randomUser.image);
                }
            }

        }, 2000); // Run simulation tick every 2 seconds
    }

    toggleNotifications() {
        const dropdown = document.getElementById('notification-dropdown');
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            // Mark as read (visual logic only, or simple counter reset)
            this.state.notifications.forEach(n => n.read = true);
            this.updateNotificationBadge();
            this.saveState();
        }
    }

    addNotification(text, image) {
        const notif = {
            id: Date.now(),
            text: text,
            image: image,
            time: new Date().toISOString(),
            read: false
        };
        this.state.notifications.unshift(notif);
        if (this.state.notifications.length > 20) this.state.notifications.pop(); // Keep last 20

        this.renderNotifications();
        this.updateNotificationBadge();
        this.saveState();
        this.playSound('pop');
    }

    renderNotifications() {
        const list = document.getElementById('notification-list');
        const noMsg = document.getElementById('no-notifications');

        if (this.state.notifications.length === 0) {
            list.innerHTML = '';
            noMsg.style.display = 'block';
            return;
        }

        noMsg.style.display = 'none';
        list.innerHTML = '';

        this.state.notifications.forEach(n => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            if(!n.read) item.style.borderLeft = '3px solid #ff4b2b';

            item.innerHTML = `
                <img src="${n.image}" alt="User">
                <div class="notif-content">
                    <div class="notif-text">${n.text}</div>
                    <span class="notif-time">${this.timeAgo(n.time)}</span>
                </div>
            `;
            list.appendChild(item);
        });
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        const unreadCount = this.state.notifications.filter(n => !n.read).length;

        if (unreadCount > 0) {
            badge.innerText = unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    clearNotifications() {
        this.state.notifications = [];
        this.renderNotifications();
        this.updateNotificationBadge();
        this.saveState();
    }

    playSound(type) {
        if (this.state.preferences.muted) return;
        if (this.sounds[type]) {
            this.sounds[type].currentTime = 0;
            this.sounds[type].play().catch(e => console.log("Audio play failed (user interaction needed first)", e));
        }
    }

    applyTheme() {
        if (this.state.preferences.darkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
    }

    toggleTheme() {
        this.state.preferences.darkMode = !this.state.preferences.darkMode;
        this.applyTheme();
        this.saveState();
    }

    triggerUpload() {
        document.getElementById('file-upload').click();
    }

    handleFileUpload(input) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                let memeData = {
                    url: e.target.result,
                    source: 'upload',
                    title: 'Custom Upload',
                    caption: 'My Custom Meme 😎'
                };

                // Enrich with Social Data (User is Author)
                memeData = this.generateFakePostData(memeData);
                memeData.author = this.state.currentUser; // Override author
                memeData.timestamp = new Date().toISOString();
                memeData.stats = { views: 0, likes: 0, shares: 0, comments: 0 };

                // Add to state and render immediately
                this.state.memes.unshift(memeData);

                // If in feed view, render it at the top
                if (this.state.view === 'feed') {
                    // Check if it is already in DOM to avoid duplicate if we have complex logic
                    // But here we just created it.
                    // Wait, if we switchView('feed') it might have been cleared?
                    // Let's rely on manual insertion since we want it at the top NOW.
                    const memeDiv = document.createElement("div");
                    this.createMemeCard(memeData, memeDiv);
                    this.feed.insertBefore(memeDiv.firstElementChild, this.feed.firstChild);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    this.switchView('feed');
                    // switchView renders the feed if empty.
                    // If not empty, we need to insert.
                    // If we just rendered (was empty), renderFeed pulls from state.memes.
                    // Since we unshifted, renderFeed will likely pick the FIRST one (our new one).
                    // BUT renderFeed removes from state.memes: "const meme = this.state.memes.shift();"
                    // If renderFeed runs, it consumes our new meme.
                    // If renderFeed DOES NOT run (feed not empty), we need to insert manually.

                    // Let's check if the first child is our meme.
                    // A safer way is:
                    // 1. switchView('feed')
                    // 2. Check if the top meme in DOM matches our URL.
                    // Since we use blob URL, we can check src.

                    const firstMemeImg = this.feed.querySelector('.meme img');
                    if (!firstMemeImg || firstMemeImg.src !== memeData.url) {
                         const memeDiv = document.createElement("div");
                         this.createMemeCard(memeData, memeDiv);
                         this.feed.insertBefore(memeDiv.firstElementChild, this.feed.firstChild);
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                this.playSound('success');
            };

            reader.readAsDataURL(file);
        }
    }

    openMemeEditor(imageSrc = null) {
        document.getElementById('meme-generator').classList.remove('hidden');
        this.memeEditorState = {
            image: null,
            topText: '',
            bottomText: '',
            fontSize: 40,
            color: '#ffffff'
        };

        const canvas = document.getElementById('meme-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Reset inputs
        document.getElementById('top-text').value = '';
        document.getElementById('bottom-text').value = '';
        document.getElementById('text-size').value = 40;
        document.getElementById('text-color').value = '#ffffff';

        if (imageSrc) {
            this.loadImageToCanvas(imageSrc);
        }
    }

    closeMemeEditor() {
        document.getElementById('meme-generator').classList.add('hidden');
    }

    loadEditorImage(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => this.loadImageToCanvas(e.target.result);
            reader.readAsDataURL(input.files[0]);
        }
    }

    loadImageToCanvas(src) {
        const img = new Image();
        img.onload = () => {
            this.memeEditorState.image = img;
            this.drawCanvas();
        };
        img.src = src;
    }

    drawCanvas() {
        if (!this.memeEditorState.image) return;

        const canvas = document.getElementById('meme-canvas');
        const ctx = canvas.getContext('2d');

        // Update state from inputs
        this.memeEditorState.topText = document.getElementById('top-text').value.toUpperCase();
        this.memeEditorState.bottomText = document.getElementById('bottom-text').value.toUpperCase();
        this.memeEditorState.fontSize = parseInt(document.getElementById('text-size').value);
        this.memeEditorState.color = document.getElementById('text-color').value;

        // Resize canvas to match image aspect ratio but keep max width 500
        const scale = Math.min(500 / this.memeEditorState.image.width, 500 / this.memeEditorState.image.height);
        canvas.width = this.memeEditorState.image.width * scale;
        canvas.height = this.memeEditorState.image.height * scale;

        // Draw Image
        ctx.drawImage(this.memeEditorState.image, 0, 0, canvas.width, canvas.height);

        // Text Styles
        ctx.fillStyle = this.memeEditorState.color;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = Math.max(2, this.memeEditorState.fontSize / 15);
        ctx.font = `bold ${this.memeEditorState.fontSize}px Impact, sans-serif`;
        ctx.textAlign = 'center';

        // Draw Top Text
        if (this.memeEditorState.topText) {
            ctx.textBaseline = 'top';
            const x = canvas.width / 2;
            const y = 10;
            ctx.strokeText(this.memeEditorState.topText, x, y, canvas.width - 20);
            ctx.fillText(this.memeEditorState.topText, x, y, canvas.width - 20);
        }

        // Draw Bottom Text
        if (this.memeEditorState.bottomText) {
            ctx.textBaseline = 'bottom';
            const x = canvas.width / 2;
            const y = canvas.height - 10;
            ctx.strokeText(this.memeEditorState.bottomText, x, y, canvas.width - 20);
            ctx.fillText(this.memeEditorState.bottomText, x, y, canvas.width - 20);
        }
    }

    publishMeme() {
        const canvas = document.getElementById('meme-canvas');
        if (!this.memeEditorState || !this.memeEditorState.image) {
            alert("Please upload an image first!");
            return;
        }

        const dataUrl = canvas.toDataURL('image/png');

        let memeData = {
            url: dataUrl,
            source: 'created',
            title: 'My Masterpiece',
            caption: this.memeEditorState.topText || 'Fresh Meme'
        };

        memeData = this.generateFakePostData(memeData);
        memeData.author = this.state.currentUser;
        memeData.timestamp = new Date().toISOString();

        this.state.memes.unshift(memeData);

        this.trackAction('create');

        // Add to DOM
        if (this.state.view === 'feed') {
             const memeDiv = document.createElement("div");
             this.createMemeCard(memeData, memeDiv);
             this.feed.insertBefore(memeDiv.firstElementChild, this.feed.firstChild);
             window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            this.switchView('feed');
             setTimeout(() => {
                 const firstMemeImg = this.feed.querySelector('.meme img');
                 if (!firstMemeImg || firstMemeImg.src !== memeData.url) {
                      const memeDiv = document.createElement("div");
                      this.createMemeCard(memeData, memeDiv);
                      this.feed.insertBefore(memeDiv.firstElementChild, this.feed.firstChild);
                 }
                 window.scrollTo({ top: 0, behavior: 'smooth' });
             }, 100);
        }

        this.playSound('success');
        this.closeMemeEditor();
    }

    downloadMeme() {
         const canvas = document.getElementById('meme-canvas');
         if (!this.memeEditorState || !this.memeEditorState.image) return;

         const link = document.createElement('a');
         link.download = 'my-meme.png';
         link.href = canvas.toDataURL();
         link.click();
    }

    renderStories() {
        const container = document.getElementById('stories-container');
        if (!container) return;
        container.innerHTML = '';

        // Add "My Story" (Upload)
        const myStoryHTML = `
            <div class="story-item" onclick="app.triggerUpload()">
                <div class="story-circle">
                    <img src="${this.state.currentUser.image}" alt="Me">
                </div>
                <div class="story-username">You</div>
            </div>
        `;
        container.innerHTML += myStoryHTML;

        // Add Network Stories
        this.state.networkUsers.forEach(user => {
            const hasViewed = this.state.engagement[`story_${user.id}`];
            const viewedClass = hasViewed ? 'viewed' : '';

            const storyHTML = `
                <div class="story-item" onclick="app.openStory('${user.id}')">
                    <div class="story-circle ${viewedClass}">
                        <img src="${user.image}" alt="${user.name}">
                    </div>
                    <div class="story-username">${user.name}</div>
                </div>
            `;
            container.innerHTML += storyHTML;
        });
    }

    openStory(userId) {
        const user = this.state.networkUsers.find(u => u.id === userId);
        if (!user) return;

        // Generate a fake story content if not exists or just random
        // For simulation, we'll pick a random meme from our pool or generic
        const randomMeme = this.getRandomItem(this.state.memes);
        const storyImage = randomMeme ? randomMeme.url : 'https://i.imgflip.com/1g8my4.jpg';
        const storyCaption = user.text || "Hello world";

        document.getElementById('story-author-img').src = user.image;
        document.getElementById('story-author-name').innerText = user.name;
        document.getElementById('story-image').src = storyImage;
        document.getElementById('story-caption').innerText = storyCaption;

        document.getElementById('story-viewer').classList.remove('hidden');

        // Mark as viewed
        this.state.engagement[`story_${user.id}`] = true;
        this.saveState();
        this.renderStories(); // Update circles

        this.startStoryProgress();
    }

    closeStory() {
        document.getElementById('story-viewer').classList.add('hidden');
        if (this.storyInterval) clearInterval(this.storyInterval);
    }

    startStoryProgress() {
        if (this.storyInterval) clearInterval(this.storyInterval);
        const progressFill = document.getElementById('story-progress');
        let width = 0;

        this.storyInterval = setInterval(() => {
            width += 1;
            progressFill.style.width = width + '%';
            if (width >= 100) {
                this.closeStory();
            }
        }, 30); // 3 seconds total (30ms * 100)
    }

    trackAction(action) {
        if (!this.state.userStats) return;

        if (action === 'view') this.state.userStats.memesViewed++;
        if (action === 'like') {
            this.state.userStats.memesLiked++;
            this.state.userStats.xp += 5;
        }
        if (action === 'comment') {
            this.state.userStats.commentsPosted++;
            this.state.userStats.xp += 10;
        }
        if (action === 'create') {
            this.state.userStats.memesCreated++;
            this.state.userStats.xp += 50;
        }

        // XP for viewing (less frequent)
        if (action === 'view') this.state.userStats.xp += 1;

        this.checkLevelUp();
        this.checkBadges();
        this.saveState();
    }

    checkLevelUp() {
        const xpNeeded = this.state.userStats.level * 100;
        if (this.state.userStats.xp >= xpNeeded) {
            this.state.userStats.level++;
            this.state.userStats.xp -= xpNeeded;
            this.showToast(`🎉 Level Up! You are now Level ${this.state.userStats.level}`);
            this.playSound('success');
        }
    }

    checkBadges() {
        this.badgesList.forEach(badge => {
            if (!this.state.userStats.badges.includes(badge.id) && badge.req(this.state.userStats)) {
                this.state.userStats.badges.push(badge.id);
                this.showToast(`🏆 Unlocked Badge: ${badge.name}`);
                this.playSound('success');
            }
        });
    }

    renderProfile() {
        document.getElementById('profile-name').innerText = this.state.currentUser.name;
        document.getElementById('profile-img').src = this.state.currentUser.image;

        // Level
        const titles = ["Lurker", "Novice", "Memer", "Pro Memer", "Meme Lord", "God Tier"];
        const titleIndex = Math.min(Math.floor((this.state.userStats.level - 1) / 2), titles.length - 1);
        document.getElementById('profile-level').innerText = `Level ${this.state.userStats.level}: ${titles[titleIndex]}`;

        // Stats
        document.getElementById('stat-views').innerText = this.state.userStats.memesViewed;
        document.getElementById('stat-likes').innerText = this.state.userStats.memesLiked;
        document.getElementById('stat-comments').innerText = this.state.userStats.commentsPosted;
        document.getElementById('stat-created').innerText = this.state.userStats.memesCreated;

        // Badges
        const badgesContainer = document.getElementById('badges-grid');
        badgesContainer.innerHTML = '';
        this.badgesList.forEach(badge => {
            const isUnlocked = this.state.userStats.badges.includes(badge.id);
            const badgeDiv = document.createElement('div');
            badgeDiv.className = `badge-item ${isUnlocked ? '' : 'locked'}`;
            badgeDiv.title = `${badge.name}: ${badge.desc}`;
            badgeDiv.innerHTML = badge.icon;
            badgesContainer.appendChild(badgeDiv);
        });

        // Progress
        const xpNeeded = this.state.userStats.level * 100;
        const percent = (this.state.userStats.xp / xpNeeded) * 100;
        document.getElementById('level-progress-fill').style.width = `${percent}%`;
    }
}

// Initialize the app
const app = new MemeApp();
window.app = app; // Expose for inline handlers
