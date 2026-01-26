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
            renderedMemes: [] // Track memes currently in the feed for simulation
        };

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
            // Don't restore view state, always start at feed or last usage logic can be debated.
        }
    }

    saveState() {
        const stateToSave = {
            savedMemes: this.state.savedMemes,
            importedPersonalities: this.state.importedPersonalities,
            preferences: this.state.preferences,
            engagement: this.state.engagement,
            currentUser: this.state.currentUser
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

        this.feedContainer.classList.add('hidden');
        this.savedContainer.classList.add('hidden');
        this.personalitiesContainer.classList.add('hidden');

        if (viewName === 'feed') {
            this.feedContainer.classList.remove('hidden');
            if (this.feed.children.length === 0) this.renderFeed(5);
        } else if (viewName === 'saved') {
            this.savedContainer.classList.remove('hidden');
            this.renderSavedMemes();
        } else if (viewName === 'personalities') {
            this.personalitiesContainer.classList.remove('hidden');
            this.renderPersonalities();
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

        }, 2000); // Run simulation tick every 2 seconds
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
}

// Initialize the app
const app = new MemeApp();
window.app = app; // Expose for inline handlers
