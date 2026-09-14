console.log("lets start javascript");

let currentsong = new Audio();
let songs = [];
let currfolder;

// =========================================================
// FORMAT TIME
// =========================================================

function formatTime(seconds) {
    if (isNaN(seconds)) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
}

// =========================================================
// MOBILE LIBRARY
// =========================================================

const libraryOpen = document.getElementById("libraryOpen");
const libraryClose = document.getElementById("libraryClose");
const leftSidebar = document.getElementById("leftSidebar");

// =========================================================
// OPEN LIBRARY
// =========================================================

function openLibrary() {
    if (window.innerWidth <= 768) {
        leftSidebar.classList.add("library-open");
        document.body.classList.add("library-active");
    }
}

// =========================================================
// CLOSE LIBRARY
// =========================================================

function closeLibrary() {
    leftSidebar.classList.remove("library-open");
    document.body.classList.remove("library-active");
}

// =========================================================
// HAMBURGER BUTTON
// =========================================================

if (libraryOpen) {
    libraryOpen.addEventListener("click", () => {
        openLibrary();
    });
}

// =========================================================
// CLOSE BUTTON
// =========================================================

if (libraryClose) {
    libraryClose.addEventListener("click", () => {
        closeLibrary();
    });
}

// =========================================================
// OVERLAY CLICK
// =========================================================

document.addEventListener("click", (e) => {
    if (
        document.body.classList.contains("library-active") &&
        e.target === document.body
    ) {
        closeLibrary();
    }
});

// =========================================================
// GET SONGS
// =========================================================

async function getsongs(folder) {
    currfolder = folder;

    let a = await fetch(
        `http://127.0.0.1:3000/${folder}/`
    );

    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    let songList = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        // Sirf files lo, folders nahi
        if (element.href && !element.href.endsWith("/")) {
            songList.push(element.href);
        }
    }

    return songList;
}

// =========================================================
// PLAY MUSIC
// =========================================================

const playmusic = (track, pause = false) => {

    currentsong.src = track;

    if (!pause) {
        currentsong.play();

        play.src = "pause.svg";
    } else {
        play.src = "play.svg";
    }

    // Sirf actual file name
    let songName = decodeURIComponent(track)
        .split(/[\\/]/)
        .pop();

    document.querySelector(".songinfo").innerHTML = songName;

    document.querySelector(".songtime").innerHTML =
        "00:00 / 00:00";
};

// =========================================================
// MAIN FUNCTION
// =========================================================

async function main() {

    // =====================================================
    // PLAYLIST UL
    // =====================================================

    let songul = document
        .querySelector(".songlist")
        .getElementsByTagName("ul")[0];

    // =====================================================
    // LOAD PLAYLIST
    // =====================================================

    function loadPlaylist() {

        songul.innerHTML = "";

        for (const song of songs) {

            let songName = decodeURIComponent(song)
                .split(/[\\/]/)
                .pop();

            songul.innerHTML += `
                <li>

                    <img
                        class="invert"
                        src="music.svg"
                        alt=""
                    >

                    <div class="info">

                        <div class="set">
                            ${songName}
                        </div>

                        <div class="set">
                            Crazy ritik
                        </div>

                    </div>

                    <div class="playnow">

                        <p>Play now</p>

                        <img
                            class="invert"
                            src="play.svg"
                            alt=""
                        >

                    </div>

                </li>
            `;
        }

        // =================================================
        // SONG CLICK
        // =================================================

        Array.from(
            songul.getElementsByTagName("li")
        ).forEach((e, index) => {

            e.addEventListener("click", () => {

                playmusic(songs[index]);

            });

        });
    }

    // =====================================================
    // INITIAL PLAYLIST
    // =====================================================

    songs = await getsongs("songs/ncs");

    console.log("Songs found:", songs);

    // Library mein songs show karo
    loadPlaylist();

    // First song select karo
    if (songs.length > 0) {
        playmusic(songs[0], true);
    }

    // =====================================================
    // PLAY / PAUSE
    // =====================================================

    play.addEventListener("click", () => {

        if (currentsong.paused) {

            currentsong.play();

            play.src = "pause.svg";

        } else {

            currentsong.pause();

            play.src = "play.svg";
        }

    });

    // =====================================================
    // TIME UPDATE
    // =====================================================

    currentsong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentsong.currentTime)} / ${formatTime(
                currentsong.duration
            )}`;

        if (!isNaN(currentsong.duration)) {

            document.querySelector(".circle").style.left =
                (currentsong.currentTime /
                    currentsong.duration) * 100 + "%";
        }

    });

    // =====================================================
    // SEEKBAR
    // =====================================================

    document
        .querySelector(".seekbar")
        .addEventListener("click", (e) => {

            let percent =
                (e.offsetX /
                    e.target.getBoundingClientRect().width) * 100;

            document.querySelector(".circle").style.left =
                percent + "%";

            if (!isNaN(currentsong.duration)) {

                currentsong.currentTime =
                    (currentsong.duration * percent) / 100;
            }

        });

    // =====================================================
    // VOLUME
    // =====================================================

    let volume = document.querySelector("#volume");
    let volumeIcon = document.querySelector(".volume img");

    volume.addEventListener("input", () => {

        currentsong.volume = volume.value;

    });

    // =====================================================
    // MUTE / UNMUTE
    // =====================================================

    volumeIcon.addEventListener("click", () => {

        if (currentsong.muted) {

            currentsong.muted = false;

            volumeIcon.src = "volume.svg";

            volume.value = currentsong.volume;

        } else {

            currentsong.muted = true;

            volumeIcon.src = "mute.svg";
        }

    });

    // =====================================================
    // PREVIOUS
    // =====================================================

    previous.addEventListener("click", () => {

        let index = songs.indexOf(currentsong.src);

        if (index > 0) {

            playmusic(songs[index - 1]);

        }

    });

    // =====================================================
    // NEXT
    // =====================================================

    next.addEventListener("click", () => {

        let index = songs.indexOf(currentsong.src);

        if (index + 1 < songs.length) {

            playmusic(songs[index + 1]);

        }

    });

    // =====================================================
    // AUTO PLAY NEXT
    // =====================================================

    currentsong.addEventListener("ended", () => {

        let index = songs.indexOf(currentsong.src);

        if (index + 1 < songs.length) {

            playmusic(songs[index + 1]);

        }

    });

    // =====================================================
    // CARD CLICK
    // =====================================================

    Array.from(
        document.getElementsByClassName("card")
    ).forEach(card => {

        // =================================================
        // CARD CLICK → LOAD ALL SONGS
        // =================================================

        card.addEventListener("click", async (e) => {

            // Agar Play button click hua hai
            // to card click dobara mat chalao
            if (e.target.closest(".play")) {
                return;
            }

            let folder = card.dataset.folder;

            // songs/ automatically add karo
            if (!folder.startsWith("songs/")) {
                folder = `songs/${folder}`;
            }

            console.log("Loading folder:", folder);

            // Folder ke saare songs lao
            songs = await getsongs(folder);

            console.log("Card songs:", songs);

            // Library playlist update karo
            loadPlaylist();

            // Mobile par Library automatically open karo
            openLibrary();

        });

        // =================================================
        // CARD PLAY BUTTON
        // =================================================

        let cardPlay = card.querySelector(".play");

        if (cardPlay) {

            cardPlay.addEventListener(
                "click",
                async (e) => {

                    e.stopPropagation();

                    let folder = card.dataset.folder;

                    // songs/ automatically add karo
                    if (!folder.startsWith("songs/")) {
                        folder = `songs/${folder}`;
                    }

                    console.log(
                        "Playing folder:",
                        folder
                    );

                    // Folder ke saare songs lao
                    songs = await getsongs(folder);

                    console.log(
                        "Folder songs:",
                        songs
                    );

                    // Library update karo
                    loadPlaylist();

                    // Mobile par Library open karo
                    openLibrary();

                    // First song play karo
                    if (songs.length > 0) {

                        playmusic(songs[0]);

                    }

                }
            );
        }

    });
}

// =========================================================
// START
// =========================================================

main();