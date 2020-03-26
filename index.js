var server = require('ws').Server;
var s = new server({ port:8080 });
var ip = require('ip');
console.log(ip.address());
console.log(s.address());
CLIENTS = [];
NAMES = [];
ROOM = [];
R_QUESTIONS = [];
R_ANSWERS = []; //answers submitted
R_ANSW_IDX = []; //players index who submitted answers
SELECTED_ANS = []; //player index whose answer is selected
SELECTED_ANS_IDX = []; // player index who selected answer
SCORES = []
QUESTIONS = ['Do you like this game?','Where do you stay','What do you do in quarantine','Are you cool?','Who is noob?','Is Science 2 good course','Do you like hyderabad','how you doing?','are you dead?','Do you like this question?'];

var can_play = 0;
s.on('connection',function(ws){
	ws.on('message',function(message){

		var data = JSON.parse(message);
		console.log("Received:"+ data.type);
		if (data.type == "create") {
				var i = ROOM.length;
				R_QUESTIONS[i] = shuffle(QUESTIONS);
				ROOM[i] = [];
				NAMES[i] = [];
				ROOM[i][0] = ws;
				NAMES[i][0] = data.name;
				SCORES[i] = [];
				SCORES[i][0] = 0;
				R_ANSWERS[i] = [];
				R_ANSW_IDX[i] = [];
				SELECTED_ANS[i] = [];
				SELECTED_ANS_IDX[i] = [];
				var msg = {
					"type" : "create",
					"room" : i,
					"data" : data.name + " created room " + i
				};
				ROOM[i][0].send(JSON.stringify(msg));
		}
		else if (data.type == "join") {
				var i = data.room;
				var l = ROOM[i].length
				ROOM[i][l] = ws;
				NAMES[i][l] = data.name;
				SCORES[i][l] = 0;
				var msg = {
					"type" : "join",
					"room" : i,
					"data" : data.name + " joined room",
					"player_no" : l,
					"players" : NAMES[i]
				};
				// for (let x = 0; x < l+1; x ++ ) {
				ROOM[i][l].send(JSON.stringify(msg));
				// }
				msg.type = "new_player";
				for (let x = 0; x < l + 1; x ++ ) {
					ROOM[i][x].send(JSON.stringify(msg));
				}
		}
		else if (data.type == "play") {
				var i = data.room;
				var q_no = data.question_no
				var l = ROOM[i].length
				var msg = {
					"type" : "play",
					"room" : i,
					"q_no" : q_no,
					"data" : R_QUESTIONS[i][q_no]
				};
				R_ANSWERS[i][q_no] = [];
				R_ANSW_IDX[i][q_no] = [];
				SELECTED_ANS[i][q_no] = [];
				SELECTED_ANS_IDX[i][q_no] = [];
				console.log("play message : ", JSON.stringify(msg))
				for (let x = 0; x < l; x ++ ) {
					ROOM[i][x].send(JSON.stringify(msg));
				}
		}
		else if (data.type == "answer") {
				var p_no = data.player_no;
				var q_no = data.q_no;
				var answer = data.answer;
				var i = data.room;
				var l = R_ANSWERS[i][q_no].length;

				R_ANSWERS[i][q_no][l] = answer
				R_ANSW_IDX[i][q_no][l] = p_no
				if (R_ANSWERS[i][q_no].length == NAMES[i].length) {
					console.log("answers : " + R_ANSWERS[i][q_no]);
					console.log("answers idx : " + R_ANSW_IDX[i][q_no]);
					msg = {
						"type" : "select_answer",
						"room" : i,
						"q_no" : q_no,
						"answers" : R_ANSWERS[i][q_no],
						"answers_idx" : R_ANSW_IDX[i][q_no]
					}
					for (let x = 0; x < l + 1; x ++ ) {
						ROOM[i][x].send(JSON.stringify(msg));
					}
				}
		}
		else if (data.type == "select") {
			var i = data.room;
			var q_no = data.q_no;
			var p_no = data.p_no;
			var ans = data.ans;

			var l = SELECTED_ANS[i][q_no].length;

			SELECTED_ANS[i][q_no][l] = ans;
			SELECTED_ANS_IDX[i][q_no][l] = p_no;

			SCORES[i][ans] += 1;

			console.log("scores : " + SCORES[i]);
			console.log("selected ans : " + SELECTED_ANS[i][q_no]);
			if (SELECTED_ANS[i][q_no].length == NAMES[i].length) {
				msg = {
					"type" : "score",
					"room" : i,
					"q_no" : q_no,
					"scores" : SCORES[i],
					"selected_ans" : SELECTED_ANS[i][q_no],
					"selected_ans_idx" : SELECTED_ANS_IDX[i][q_no]
				}
				for (let x = 0; x < l + 1; x ++ ) {
					ROOM[i][x].send(JSON.stringify(msg));
				}
			}

		}

	})
});

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
