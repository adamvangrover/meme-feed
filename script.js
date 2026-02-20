class MemeApp {
    // === STATE & INIT ===
    constructor() {
        this.feed = document.getElementById("feed");
        this.savedFeed = document.getElementById("saved-feed");
        this.loadingIndicator = document.querySelector(".loading");
        this.errorMessage = document.querySelector(".error-message");
        this.feedContainer = document.getElementById("feed-container");
        this.savedContainer = document.getElementById("saved-container");
        this.personalitiesContainer = document.getElementById("personalities-container");
        this.personalitiesFeed = document.getElementById("personalities-feed");
        this.soundboardContainer = document.getElementById("soundboard-container");
        this.shopContainer = document.getElementById("shop-container");
        this.battleContainer = document.getElementById("battle-container");

        this.state = {
            memes: [],
            savedMemes: [],
            importedPersonalities: [],
            preferences: {
                darkMode: true,
                source: 'all',
                muted: false,
                theme: 'default' // 'default', 'matrix', 'vaporwave', 'cyberpunk'
            },
            searchQuery: '',
            engagement: {},
            pagination: {
                redditAfter: null,
                giphyOffset: 0
            },
            view: 'feed', // 'feed', 'saved', 'personalities', 'soundboard', 'profile'
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
                coins: 100, // Starting coins
                memesViewed: 0,
                memesLiked: 0,
                commentsPosted: 0,
                memesCreated: 0,
                badges: []
            },
            inventory: {
                themes: ['default'],
                stickers: []
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
            pop: new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3'),
            success: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
            airhorn: new Audio('https://www.myinstants.com/media/sounds/mlg-airhorn.mp3'),
            bruh: new Audio('https://www.myinstants.com/media/sounds/movie_1.mp3'),
            cricket: new Audio('https://www.myinstants.com/media/sounds/cricket_1.mp3'),
            violin: new Audio('https://www.myinstants.com/media/sounds/sad-violin-airhorn.mp3'),
            wow: new Audio('https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3'),
            fart: new Audio('https://www.myinstants.com/media/sounds/fart-with-reverb.mp3')
        };
        // Lower volume
        Object.values(this.sounds).forEach(s => s.volume = 0.2);

        this.templates = []; // Will load from API

        this.shopItems = [
            { id: 'theme_matrix', type: 'theme', name: 'Matrix Theme', desc: 'Enter the Matrix', price: 200, value: 'matrix', icon: '💻' },
            { id: 'theme_vaporwave', type: 'theme', name: 'Vaporwave', desc: 'A E S T H E T I C', price: 300, value: 'vaporwave', icon: '🌴' },
            { id: 'theme_cyberpunk', type: 'theme', name: 'Cyberpunk', desc: 'Wake up Samurai', price: 500, value: 'cyberpunk', icon: '🤖' },
            { id: 'coins_100', type: 'consumable', name: '100 Coins', desc: 'Get rich quick (Demo)', price: 0, value: 100, icon: '💰' } // Free for demo
        ];

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
            if (this.state.preferences.source === 'reddit') {
                 document.getElementById('reddit-sort').classList.remove('hidden');
                 document.getElementById('reddit-sort').value = this.state.preferences.redditSort || 'hot';
            }

            if (this.state.view === 'feed') {
                this.fetchMemes().then(() => this.renderFeed(5));
            } else {
                this.switchView('saved');
            }

            this.startNetworkSimulation();
        });

        this.loadTemplates();
    }

    handleSearch(query) {
        this.state.searchQuery = query;
        // Debounce slightly or just run
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.state.memes = [];
            this.feed.innerHTML = '';
            // Reset pagination
            this.state.pagination.redditAfter = null;
            this.state.pagination.giphyOffset = 0;

            this.fetchMemes().then(() => this.renderFeed(5));
        }, 500);
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
            if(parsed.inventory) this.state.inventory = { ...this.state.inventory, ...parsed.inventory };
            if(parsed.notifications) this.state.notifications = parsed.notifications;
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
            inventory: this.state.inventory,
            notifications: this.state.notifications
        };
        localStorage.setItem('memeAppState', JSON.stringify(stateToSave));
    }

    exportData() {
        const stateToSave = {
            savedMemes: this.state.savedMemes,
            importedPersonalities: this.state.importedPersonalities,
            preferences: this.state.preferences,
            engagement: this.state.engagement,
            currentUser: this.state.currentUser,
            userStats: this.state.userStats,
            notifications: this.state.notifications
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateToSave, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "meme_feed_backup.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        this.showToast("Data Exported 📤");
    }

    triggerImport() {
        document.getElementById('import-file').click();
    }

    importData(input) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    // Basic validation
                    if (data.preferences && data.userStats) {
                        this.state.savedMemes = data.savedMemes || [];
                        this.state.importedPersonalities = data.importedPersonalities || [];
                        this.state.preferences = { ...this.state.preferences, ...data.preferences };
                        this.state.engagement = data.engagement || {};
                        if(data.currentUser) this.state.currentUser = data.currentUser;
                        if(data.userStats) this.state.userStats = { ...this.state.userStats, ...data.userStats };
                        if(data.notifications) this.state.notifications = data.notifications;

                        this.saveState();
                        this.applyTheme();
                        this.renderProfile();
                        this.showToast("Data Imported Successfully 🎉");
                        setTimeout(() => location.reload(), 1000); // Reload to ensure clean state
                    } else {
                        alert("Invalid JSON format");
                    }
                } catch (err) {
                    console.error("Import error", err);
                    alert("Failed to parse JSON");
                }
            };
            reader.readAsText(file);
        }
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

    // === UI HANDLERS & EVENTS ===
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

        const sortSelect = document.getElementById('reddit-sort');
        if (source === 'reddit') {
            sortSelect.classList.remove('hidden');
            // Restore sort preference
            sortSelect.value = this.state.preferences.redditSort || 'hot';
        } else {
            sortSelect.classList.add('hidden');
        }

        this.state.memes = []; // Clear current pool
        this.feed.innerHTML = ''; // Clear display
        this.saveState();
        this.fetchMemes().then(() => this.renderFeed(5));
    }

    setRedditSort(sort) {
        this.state.preferences.redditSort = sort;
        this.state.memes = [];
        this.feed.innerHTML = '';
        this.saveState();
        this.fetchMemes().then(() => this.renderFeed(5));
    }

    switchView(viewName) {
        this.state.view = viewName;
        document.getElementById('btn-feed').classList.toggle('active', viewName === 'feed');
        document.getElementById('btn-saved').classList.toggle('active', viewName === 'saved');
        document.getElementById('btn-personalities').classList.toggle('active', viewName === 'personalities');
        document.getElementById('btn-soundboard').classList.toggle('active', viewName === 'soundboard');
        document.getElementById('btn-battle').classList.toggle('active', viewName === 'battle');
        document.getElementById('btn-shop').classList.toggle('active', viewName === 'shop');
        document.getElementById('btn-profile').classList.toggle('active', viewName === 'profile');

        this.feedContainer.classList.add('hidden');
        this.savedContainer.classList.add('hidden');
        this.personalitiesContainer.classList.add('hidden');
        this.soundboardContainer.classList.add('hidden');
        this.battleContainer.classList.add('hidden');
        this.shopContainer.classList.add('hidden');
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
        } else if (viewName === 'soundboard') {
            this.soundboardContainer.classList.remove('hidden');
            this.renderSoundboard();
        } else if (viewName === 'battle') {
            this.battleContainer.classList.remove('hidden');
            this.renderBattle();
        } else if (viewName === 'shop') {
            this.shopContainer.classList.remove('hidden');
            this.renderShop();
        } else if (viewName === 'profile') {
            document.getElementById('profile-container').classList.remove('hidden');
            this.renderProfile();
        }
    }

    // === API CALLS & DATA FETCHING ===
    async fetchMemes() {
        this.loadingIndicator.style.display = "block";
        this.errorMessage.style.display = "none";

        const newMemes = [];
        const source = this.state.preferences.source;
        const query = this.state.searchQuery;

        try {
            // Imgflip (Only fetch once or sparingly as they don't paginate well)
            if ((source === 'all' || source === 'imgflip') && this.state.memes.filter(m => m.source === 'imgflip').length < 10) {
                try {
                    const imgflipResponse = await fetch("https://api.imgflip.com/get_memes");
                    const imgflipData = await imgflipResponse.json();
                    if (imgflipData.success) {
                        let memes = imgflipData.data.memes;
                        if (query) {
                            memes = memes.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));
                        }
                        memes.forEach(m => {
                           newMemes.push({ url: m.url, source: 'imgflip', width: m.width, height: m.height, title: m.name });
                        });
                    }
                } catch (e) { console.error("Imgflip error", e); }
            }

            // Reddit
            if (source === 'all' || source === 'reddit') {
                try {
                    const sort = this.state.preferences.redditSort || 'hot';
                    const after = this.state.pagination.redditAfter ? `&after=${this.state.pagination.redditAfter}` : '';

                    let url = `https://www.reddit.com/r/memes/${sort}.json?limit=25${after}`;
                    if (query) {
                        url = `https://www.reddit.com/r/memes/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=25${after}`;
                    }

                    const redditResponse = await fetch(url);
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

                    let url = `https://api.giphy.com/v1/gifs/trending?api_key=${giphyApiKey}&limit=10&rating=pg-13&offset=${offset}`;
                    if (query) {
                        url = `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(query)}&limit=10&rating=pg-13&offset=${offset}`;
                    }

                    const giphyResponse = await fetch(url);
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

            // Memory Management: Keep simulated list size in check
            if (this.state.renderedMemes.length > 100) {
                this.state.renderedMemes.shift();
            }

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

    renderSoundboard() {
        const grid = document.getElementById('soundboard-grid');
        grid.innerHTML = '';
        Object.keys(this.sounds).forEach(key => {
            const btn = document.createElement('div');
            btn.className = 'sound-btn';
            btn.onclick = () => this.playSound(key);
            btn.innerHTML = `
                <i class="fas fa-music"></i>
                <span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>
            `;
            grid.appendChild(btn);
        });
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

    renderShop() {
        const grid = document.getElementById('shop-grid');
        const coinsEl = document.getElementById('user-coins');
        grid.innerHTML = '';
        coinsEl.innerText = this.state.userStats.coins;

        this.shopItems.forEach(item => {
            const isOwned = this.state.inventory.themes.includes(item.value) || (item.type === 'consumable' ? false : false); // Consumables not owned permanently logic for demo
            const isEquipped = this.state.preferences.theme === item.value;

            const card = document.createElement('div');
            card.className = 'shop-item';

            let btnHtml = '';
            if (item.type === 'theme') {
                if (isEquipped) {
                    btnHtml = `<button class="shop-btn owned" disabled>Equipped</button>`;
                } else if (isOwned) {
                    btnHtml = `<button class="shop-btn equip" onclick="app.equipTheme('${item.value}')">Equip</button>`;
                } else {
                    const canAfford = this.state.userStats.coins >= item.price;
                    btnHtml = `<button class="shop-btn" ${canAfford ? '' : 'disabled'} onclick="app.buyItem('${item.id}')">Buy ${item.price}</button>`;
                }
            } else {
                 btnHtml = `<button class="shop-btn" onclick="app.buyItem('${item.id}')">Get ${item.price}</button>`;
            }

            card.innerHTML = '';

            const iconDiv = document.createElement('div');
            iconDiv.className = 'shop-item-icon';
            iconDiv.innerText = item.icon;

            const h3 = document.createElement('h3');
            h3.innerText = item.name;

            const p = document.createElement('p');
            p.innerText = item.desc;

            card.appendChild(iconDiv);
            card.appendChild(h3);
            card.appendChild(p);

            // Insert button safely
            card.insertAdjacentHTML('beforeend', btnHtml);

            grid.appendChild(card);
        });
    }

    buyItem(itemId) {
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) return;

        if (item.type === 'consumable') {
            // Free coins logic
            this.state.userStats.coins += item.value;
            this.showToast(`💰 Received ${item.value} Coins!`);
            this.playSound('success');
            this.saveState();
            this.renderShop();
            return;
        }

        if (this.state.userStats.coins >= item.price) {
            this.state.userStats.coins -= item.price;
            if (item.type === 'theme') {
                this.state.inventory.themes.push(item.value);
            }
            this.showToast(`Bought ${item.name}!`);
            this.playSound('success');
            this.saveState();
            this.renderShop();
        } else {
            this.showToast("Not enough coins! 💸");
        }
    }

    equipTheme(theme) {
        this.state.preferences.theme = theme;
        this.applyTheme();
        this.saveState();
        this.renderShop();
        this.showToast(`Theme changed to ${theme}! 🎨`);
    }

    renderBattle() {
        const left = document.getElementById('battle-left');
        const right = document.getElementById('battle-right');

        // Pick 2 random memes
        // If we have less than 2, fetch more first, but for simplicity assume we have pool
        if (this.state.memes.length < 2) {
             this.fetchMemes().then(() => this.renderBattle());
             return;
        }

        // Ensure they are different
        let m1 = this.getRandomItem(this.state.memes);
        let m2 = this.getRandomItem(this.state.memes);
        while(m1.url === m2.url) {
            m2 = this.getRandomItem(this.state.memes);
        }

        this.renderBattleCard(m1, left);
        this.renderBattleCard(m2, right);
    }

    renderBattleCard(meme, container) {
        container.innerHTML = '';

        const h3 = document.createElement('h3');
        h3.innerText = meme.title || 'Funny Meme';

        const img = document.createElement('img');
        img.src = meme.url;
        img.loading = "lazy";

        const btn = document.createElement('button');
        btn.className = "action-btn primary";
        btn.onclick = () => this.voteBattle(btn);
        btn.innerText = "Vote This!";

        container.appendChild(h3);
        container.appendChild(img);
        container.appendChild(btn);
    }

    voteBattle(btn) {
        // Visual feedback
        const winnerCard = btn.closest('.battle-side');
        winnerCard.style.borderColor = '#00ff00';
        winnerCard.style.transform = 'scale(1.05)';

        this.playSound('pop');
        this.showToast('Voted! +10 XP +5 Coins');

        // Award
        this.state.userStats.xp += 10;
        this.state.userStats.coins += 5;
        this.checkLevelUp();
        this.saveState();

        // Delay and reload
        setTimeout(() => {
             winnerCard.style.borderColor = 'transparent';
             winnerCard.style.transform = 'scale(1)';
             this.renderBattle();
        }, 800);
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

    // === SIMULATION & ENGAGEMENT ===
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
                let randomUser = this.getRandomItem(this.state.networkUsers);
                let randomComment = "";

                // ENHANCED: Personality Interaction
                // If the meme author is a network user (personality), another personality might comment something specific
                if (randomMeme && randomMeme.author && this.state.networkUsers.some(u => u.id === randomMeme.author.id)) {
                    // Filter out the author so they don't comment on their own post
                    const otherUsers = this.state.networkUsers.filter(u => u.id !== randomMeme.author.id);
                    if (otherUsers.length > 0) {
                        randomUser = this.getRandomItem(otherUsers);
                        // Interactions based on simple rules or random
                        const interactions = [
                            `@${randomMeme.author.name} stop posting this`,
                            `@${randomMeme.author.name} actually funny for once`,
                            `@${randomMeme.author.name} 💀💀💀`,
                            `Classic @${randomMeme.author.name}`
                        ];
                        randomComment = this.getRandomItem(interactions);
                    }
                }

                // Default comment if not interactive or meme author is generic
                if (!randomComment) {
                     randomComment = this.getRandomItem([
                        "LOL 😂", "I can't breathe 💀", "This is so true", "Delete this",
                        "Sent to my mom", "Literally me", "Who did this? 🤣", "Underrated",
                        "Take my upvote", "👀", "🔥", "Wait what?", "Classic"
                    ]);
                }

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
        // Clear all theme classes
        document.body.className = '';

        // Base Dark/Light
        if (!this.state.preferences.darkMode) {
            document.body.classList.add('light-mode');
        }

        // Apply Custom Theme
        if (this.state.preferences.theme && this.state.preferences.theme !== 'default') {
            document.body.classList.add(`theme-${this.state.preferences.theme}`);
        }
    }

    toggleTheme() {
        this.state.preferences.darkMode = !this.state.preferences.darkMode;
        this.applyTheme();
        this.saveState();
    }

    toggleZenMode() {
        const btn = document.getElementById('btn-zen');
        if (this.zenInterval) {
            clearInterval(this.zenInterval);
            this.zenInterval = null;
            btn.classList.remove('zen-active');
            this.showToast("Zen Mode Off 🛑");
        } else {
            this.zenInterval = setInterval(() => {
                // Pause if hovering over a meme
                if (!document.querySelector('.meme:hover')) {
                     window.scrollBy(0, 1);
                }
            }, 30);
            btn.classList.add('zen-active');
            this.showToast("Zen Mode On 🍃");
        }
    }

    toggleShortcuts() {
        document.getElementById('shortcuts-modal').classList.toggle('hidden');
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
            color: '#ffffff',
            stickers: []
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

        this.renderTemplates();
    }

    async loadTemplates() {
        try {
            const response = await fetch('https://api.imgflip.com/get_memes');
            const data = await response.json();
            if (data.success) {
                this.templates = data.data.memes;
            }
        } catch (e) {
            console.error("Failed to load templates", e);
        }
    }

    renderTemplates() {
        const list = document.getElementById('template-list');
        list.innerHTML = '';
        if (this.templates.length === 0) {
            list.innerHTML = '<p style="padding:10px; color:#888;">Loading templates...</p>';
            return;
        }

        this.templates.forEach(t => {
            const img = document.createElement('img');
            img.src = t.url;
            img.className = 'template-thumb';
            img.title = t.name;
            img.onclick = () => this.selectTemplate(t.url);
            list.appendChild(img);
        });
    }

    selectTemplate(url) {
        // Use proxy or crossOrigin anonymous if possible, but Imgflip supports CORS mostly.
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            this.memeEditorState.image = img;
            this.drawCanvas();
        };
        img.onerror = () => {
            // Fallback if CORS fails (might happen with canvas export)
            this.loadImageToCanvas(url);
        };
        img.src = url;
    }

    generateMagicCaption() {
        const topCaptions = [
            "WHEN YOU", "POV:", "NOBODY:", "ME:", "TEACHER:", "MY BRAIN:",
            "WAIT", "HOL UP", "THE MOMENT", "THAT FEELING WHEN", "WHY IS IT THAT"
        ];
        const bottomCaptions = [
            "FORGOT TO SAVE", "SEE A BUG", "DEPLOY TO PROD", "LOSE INTERNET",
            "EAT THE LAST SLICE", "TEXT YOUR EX", "START CODING", "REALIZED IT'S MONDAY",
            "FIND A MEME", "GET 100 LIKES", "TOUCH GRASS"
        ];

        // Randomly pick top/bottom or just one
        if (Math.random() > 0.5) {
            document.getElementById('top-text').value = this.getRandomItem(topCaptions);
            document.getElementById('bottom-text').value = this.getRandomItem(bottomCaptions);
        } else {
            // Use existing long captions split up
            const longCap = this.getRandomItem(this.captions);
            const mid = Math.floor(longCap.length / 2);
            // Split near middle space
            const splitIdx = longCap.indexOf(' ', mid);
            if (splitIdx !== -1) {
                document.getElementById('top-text').value = longCap.substring(0, splitIdx);
                document.getElementById('bottom-text').value = longCap.substring(splitIdx + 1);
            } else {
                document.getElementById('bottom-text').value = longCap;
                document.getElementById('top-text').value = "";
            }
        }

        this.drawCanvas();
        this.playSound('pop');
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

    addSticker(emoji) {
        if (!this.memeEditorState.image) return;
        const canvas = document.getElementById('meme-canvas');
        // Randomize slightly
        const x = Math.random() * (canvas.width * 0.6) + (canvas.width * 0.2);
        const y = Math.random() * (canvas.height * 0.6) + (canvas.height * 0.2);

        if(!this.memeEditorState.stickers) this.memeEditorState.stickers = [];
        this.memeEditorState.stickers.push({ emoji, x, y, size: 60 });
        this.drawCanvas();
    }

    clearStickers() {
        this.memeEditorState.stickers = [];
        this.drawCanvas();
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

        // Draw Stickers
        if (this.memeEditorState.stickers) {
             this.memeEditorState.stickers.forEach(s => {
                 ctx.font = `${s.size}px serif`;
                 ctx.textBaseline = 'middle';
                 ctx.fillText(s.emoji, s.x, s.y);
             });
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

        // Chart
        // Create chart container if not exists (in stats section)
        let chartContainer = document.getElementById('stats-chart-container');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.id = 'stats-chart-container';
            chartContainer.className = 'stats-chart-container';
            // Insert after stats grid
            document.querySelector('.profile-stats').after(chartContainer);
        }

        // Normalize values for chart height (max 100%)
        // We use log scale or relative to max because views >> others
        const values = [
            { label: 'Views', value: this.state.userStats.memesViewed },
            { label: 'Likes', value: this.state.userStats.memesLiked },
            { label: 'Comments', value: this.state.userStats.commentsPosted },
            { label: 'Created', value: this.state.userStats.memesCreated }
        ];

        const maxVal = Math.max(...values.map(v => v.value)) || 1;

        chartContainer.innerHTML = `
            <h3>Activity Overview 📊</h3>
            <div class="stats-chart">
                ${values.map(v => {
                    const height = Math.max(5, (v.value / maxVal) * 100);
                    return `
                        <div class="chart-bar-wrapper">
                            <div class="chart-value">${v.value}</div>
                            <div class="chart-bar" style="height: ${height}%"></div>
                            <div class="chart-label">${v.label}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

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
