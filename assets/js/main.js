
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const progressVolume = $('#progress-volume')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isRandom: false,
    isRepeat: false,
    isPlaying:false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
    {
        name: 'Always Remember Us This Way',
        singer: 'Lady Gaga',
        path: './assets/music/AlwaysRememberUsThisWay-LadyGaga-5693911.mp3',
        image: './assets/img/1.jpg'
    },
    {
        name: 'Shallow',
        singer: 'Lady Gaga',
        path: './assets/music/Shallow-Lady-Gaga_ Bradley-Cooper.mp3',
        image: './assets/img/2.jpg'
    },
    {
        name: 'I Never Love Again',
        singer: 'Lady Gaga',
        path: './assets/music/ILlNeverLoveExtendedVersionRadioEdit-LadyGaga-5693922.mp3',
        image: './assets/img/3.jpg'
    },
    {
        name: 'Heal Me',
        singer: 'Lady Gaga',
        path: './assets/music/healme.mp3',
        image: './assets/img/4.jpg'
    },
    {
        name: 'Before I Cry',
        singer: 'Lady Gaga',
        path: './assets/music/BeforeICry-LadyGaga-5693918.mp3',
        image: './assets/img/5.png'
    },
    {
        name: 'Too Far Gone',
        singer: 'Bradley Cooper',
        path: './assets/music/toofar.mp3',
        image: './assets/img/6.jpg'
    },
    {
        name: 'Closer',
        singer: 'Chainsmoker',
        path: './assets/music/Closer - The Chainsmokers_ Halsey.mp3',
        image: './assets/img/7.jpg'
    },
    {
        name: 'One Call Away',
        singer: 'Charlie Puth',
        path: './assets/music/One Call Away - Charlie Puth.mp3',
        image: './assets/img/8.jpg'
    }
    ],
    setConfig:function(key, value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song,index) =>{
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                <div class="thumb" 
                     style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
        `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties:function(){
        Object.defineProperty(this,'currentSong',{
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents:function(){
        const _this = this
        const cdWidth = cd.offsetWidth
        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform:'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        
        // Xử lý phóng to thu nhỏ CD
        document.onscroll = function(){
            const scrollTop = document.documentElement.scrollTop || window.scrollY
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px':0
            cd.style.opacity = newCdWidth / cdWidth
        }
        // Xử lý khi play music
        playBtn.onclick = function(){
            if ( _this.isPlaying){
                audio.pause()
            }
            else{
                audio.play()
            }
        }
        // Khi song được play 
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // Khi song bị pause
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor((audio.currentTime / audio.duration * 100))
                progress.value = progressPercent
            }
        }
        // Xử lý khi tua music
        progress.onchange = function(e){
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        // Xử lý khi thay đổi âm lượng
        progressVolume.onchange = function(e){
            const volumePercent = Math.floor(e.target.value)
            audio.volume = volumePercent / 100
            $('.volume-title').textContent = `Âm lượng: ${volumePercent} %`
        }
        //Khi nhấn next Song 
        nextBtn.onclick =function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }
            else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Khi nhấn nút prev song
        prevBtn.onclick =function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }
            else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Khi nhấn random song
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
        }
        // Xử lý audio ended thì next song 
        audio.onended = function(){
           if(_this.isRepeat){
                audio.play()
           }
           else{
                nextBtn.click()
           }
        }
        // Khi nhấn Reapeat thì loop song
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }
        // Lắng nghe nhấn vào 1 song cụ thể 
        playlist.onclick = function(e){
            const songNode =  e.target.closest('.song:not(.active)')
            if(
                songNode
                && !e.target.closest('.option')
            ){
                _this.currentIndex = Number(songNode.dataset.index)
                _this.loadCurrentSong()
                _this.render()
                audio.play()
                
            }
            if(e.target.closest('.option'))
            {
                console.log(456)
            }
        }
    },
    scrollToActiveSong:function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                 block: this.currentIndex < 3 ? 'center': 'nearest' 
            })
        },300)
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },
    loadConfig:function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong:function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length)
        {
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },
    prevSong:function(){
        this.currentIndex--;
        if(this.currentIndex < 0)
        {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },
    playRandomSong : function(){
        let newIndex 
        do {
            newIndex = Math.floor(Math.random()* this.songs.length)
        }while(newIndex==this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function(){
        // Load cấu hình
        this.loadConfig()
        // Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        // Lắng nghe và xử lý các sự kiện
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()
        // Render PlayList
        this.render()
        // Hiển thị trạng thái config button đã lưu
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
}
app.start()
