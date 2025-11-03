// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "YOUR_DB_URL",
  projectId: "YOUR_PROJECT_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let gameId = 'game_' + Math.floor(Math.random()*10000);
let userId = 'user_' + Math.floor(Math.random()*1000);
let questions = [];
let currentQ = 0;
let countdown = 15;
let timerInterval;

// LIFF init
liff.init({ liffId: "YOUR_LIFF_ID" })
  .then(()=>console.log("LIFF Ready"))
  .catch(err=>console.error(err));

function createGame(){
  alert("ต้องจ่าย 50 บาท ก่อนสร้างเกม (Payment จำลอง)");
  document.getElementById('home').style.display='none';
  document.getElementById('createGame').style.display='block';
}

function addQuestion(){
  const q = document.getElementById('qText').value;
  const options = [
    document.getElementById('optA').value,
    document.getElementById('optB').value,
    document.getElementById('optC').value,
    document.getElementById('optD').value
  ];
  const answer = document.getElementById('answer').value;
  questions.push({text:q, options:options, answer:answer});
  alert("เพิ่มคำถามแล้ว");
}

function startGame(){
  db.ref('games/' + gameId + '/questions').set(questions);
  db.ref('games/' + gameId + '/host').set({userId:userId, paid:true, score:0});
  document.getElementById('createGame').style.display='none';
  showQuestion();
}

function joinGame(){
  gameId = prompt("ใส่ Game ID:");
  db.ref('games/' + gameId + '/players/' + userId).set({score:0});
  document.getElementById('home').style.display='none';
  alert("เข้าร่วมเกมสำเร็จ! รอ Host เริ่มเกม...");
}

function showQuestion(){
  if(currentQ >= questions.length){
    alert("จบเกม!");
    showLeaderboard();
    return;
  }
  const q = questions[currentQ];
  document.getElementById('question').style.display='block';
  document.getElementById('qDisplay').innerText = q.text;
  document.getElementById('btnA').innerText = q.options[0];
  document.getElementById('btnB').innerText = q.options[1];
  document.getElementById('btnC').innerText = q.options[2];
  document.getElementById('btnD').innerText = q.options[3];

  countdown = 15;
  document.getElementById('timer').innerText = countdown;
  timerInterval = setInterval(()=>{
    countdown--;
    document.getElementById('timer').innerText = countdown;
    if(countdown<=0){
      clearInterval(timerInterval);
      submitAnswer(null);
    }
  },1000);
}

function submitAnswer(ans){
  clearInterval(timerInterval);
  db.ref('games/' + gameId + '/host/answers/q' + currentQ).set({answer:ans});
  currentQ++;
  showQuestion();
}

function showLeaderboard(){
  document.getElementById('question').style.display='none';
  document.getElementById('leaderboard').style.display='block';
  const scoresList = document.getElementById('scores');
  scoresList.innerHTML='';
  db.ref('games/' + gameId + '/host').once('value',snap=>{
    const li = document.createElement('li');
    li.textContent = "Host: " + snap.val().score + " คะแนน";
    scoresList.appendChild(li);
  });
}