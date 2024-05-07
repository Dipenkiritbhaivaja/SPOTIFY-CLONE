let currentSong = new Audio();
let songs;
let currFolder;
function convertSecondsToMinutesSeconds(seconds) {

     if (isNaN(seconds) || seconds < 0) {
          return "00:00";
     }

     // Round down to the nearest whole number
     seconds = Math.floor(seconds);
     var minutes = Math.floor(seconds / 60);
     var remainingSeconds = seconds % 60;
     var minutesStr = minutes < 10 ? '0' + minutes : minutes;
     var secondsStr = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
     return `${minutesStr}:${secondsStr}`;
}

async function getSongs(folder) {
     currFolder = folder;
     let a = await fetch(`/${currFolder}/`)
     let response = await a.text();
     let div = document.createElement("div")
     div.innerHTML = response;
     let as = div.getElementsByTagName("a");
     songs = []
     for (let i = 0; i < as.length; i++) {
          const element = as[i];
          if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
               songs.push(element.href.split(`/${currFolder}/`)[1]);
          }
     }

     // display the song list
     let songul = document.querySelector(".songList").getElementsByTagName("ul")[0];
     songul.innerHTML = ""
     for (const song of songs) {
          songul.innerHTML = songul.innerHTML + `<li>
                                   <img src="svg/music.svg" alt="">
                                   <div class="info">
                                        <div>${song.replaceAll("%20", " ")}</div>
                                        <div>Krishna</div>
                                   </div>
                                   <div class="playNow">
                                        <span>play Now</span>
                                        <img src="svg/play.svg" alt="">
                                   </div>
                              </li>` ;
     }

     // Attach to event listener to each song
     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
          e.addEventListener("click", element => {
               playMusic(e.querySelector(".info").firstElementChild.innerHTML)
               console.log(e.querySelector(".info").firstElementChild.innerHTML)
          })
     })

}

const playMusic = (track, pause = false) => {
     currentSong.src = `/${currFolder}/` + track;
     if (!pause) {
          currentSong.play()
          play.src = "/svg/pause.svg";
     }
     document.querySelector(".songInfo").innerHTML = decodeURI(track);
     document.querySelector(".songTime").innerHTML = "00 : 00 / 00 : 00";

}

async function displayAlbums() {
     let a = await fetch(`/songs/`)
     let response = await a.text();
     let div = document.createElement("div")
     div.innerHTML = response;
     let anchors = div.getElementsByTagName("a");
     let cardContainer = document.querySelector(".cardContainer")
     let array = Array.from(anchors)
     for (let i = 0; i < array.length; i++) {
          const e = array[i];

          if (e.href.includes("/songs/")) {
               let folder = e.href.split("/").slice(-2)[1];
               // get the metadata of the folder
               let a = await fetch(`/songs/${folder}/info.json`);
               let response = await a.json();
               // console.log(response);   
               cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                              <img src="/songs/${folder}/cover.jpg" alt="">
                              <div class="play">
                                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                                        <circle cx="12" cy="12" r="10" fill="#00FF00" />
                                        <!-- Green circle background -->
                                        <path d="M9 16.5l6-4.5-6-4.5z" fill="#000" />
                                        <!-- Black fill for the play icon -->
                                   </svg>
                              </div>
                              <h3>${response.title}</h3>
                              <p>${response.description}</p>
                         </div>`
          }
     }

     // Load the playlist when card is clicked
     Array.from(document.getElementsByClassName("card")).forEach(e => {
          e.addEventListener("click", async item => {
               await getSongs(`songs/${item.currentTarget.dataset.folder}`);
               playMusic(songs[0]);
          });
     });
}

async function main() {

     // get the list of songs
     await getSongs(`songs/bhakti`);
     playMusic(songs[0], true)

     // Display all the albums on the page
     displayAlbums()

     // attach an event listener to play
     play.addEventListener("click", () => {
          if (currentSong.paused) {
               currentSong.play();
               play.src = "/svg/pause.svg";
          }
          else {
               currentSong.pause();
               play.src = "/svg/play.svg";
          }
     })

     // attach event listener to spacebar to play/pause songs
     document.addEventListener('keydown', (e) => {
          if (e.keyCode === 32) {
               if (currentSong.paused) {
                    currentSong.play();
                    play.src = "/svg/pause.svg";
               }
               else {
                    currentSong.pause();
                    play.src = "/svg/play.svg";
               }
          }
     });

     // listen for time update event
     currentSong.addEventListener("timeupdate", () => {
          document.querySelector(".songTime").innerHTML = `${convertSecondsToMinutesSeconds(currentSong.currentTime)}/${convertSecondsToMinutesSeconds(currentSong.duration)}`;
          document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
     })

     // Add an event listener to seekbar
     document.querySelector(".seekbar").addEventListener("click", e => {
          let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
          document.querySelector(".circle").style.left = percent + "%";
          currentSong.currentTime = (currentSong.duration * percent) / 100;
     })

     // Add an event listener for hamburger
     document.querySelector(".hamburger").addEventListener("click", () => {
          document.querySelector(".left").style.left = 0;
     })

     // Add an event listener to close hamburger
     document.querySelector(".close").addEventListener("click", () => {
          document.querySelector(".left").style.left = "-100%";
     })

     // Add an event listener to previous and next
     previous.addEventListener("click", () => {
          let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
          if ((index - 1) >= 0) {
               playMusic(songs[index - 1]);
          }
     })
     next.addEventListener("click", () => {
          let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
          if ((index + 1) < songs.length) {
               playMusic(songs[index + 1]);
          }
     })

     // Add an event to volume
     document.querySelector(".range").addEventListener("change", (e) => {
          currentSong.volume = parseInt(e.target.value) / 100;
     })

     // Add event listener to  mute the volume
     document.querySelector(".volume>img").addEventListener("click", (e) => {
          if (e.target.src.includes("svg/volume.svg")) {
               e.target.src = e.target.src.replace("svg/volume.svg", "svg/mute.svg")
               currentSong.volume = 0;
               document.querySelector(".range").value = 0
          }
          else {
               e.target.src = e.target.src.replace("svg/mute.svg", "svg/volume.svg")
               currentSong.volume = 0.2;
               document.querySelector(".range").value = 20;
          }
     })

     document.addEventListener('keydown', function (event) {
          if (event.key === 'Mute' || event.key === 'VolumeMute') {
               // Code to execute when the mute key is pressed
               console.log('Mute key pressed!');
          }
     });


}
main()