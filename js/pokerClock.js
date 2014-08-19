$(function () { pokerClock.init(); });

var pokerClock = {
	init : function(){

		$("#alertBox").dialog({ autoOpen: false, modal: true, width:300, height:200, show: 'blind', hide: 'blind'});

		$("#importStructureDialog").dialog({
			autoOpen: false,
			modal: true,
			width:400,
			height:600,
			show: 'blind',
			hide: 'blind',
			buttons: {
		        "Import": function() {
		        	var roundsString = $('#roundEntry').val();
					var rounds = roundsString.split(/\n/);
					//console.log(rounds);
					pokerClock.rounds = [];
					for(var i=0, len=rounds.length; i<len; i++){
						var round = rounds[i];

						var fields = round.split(/\s+/);
						//console.log(fields);
						for(var j=0, jlen=fields.length; j<jlen; j++){
							var field = fields[j];
							field = field.replace(/,/,'');
							field = field.replace(/\$/,'');
							fields[j] = field;
						}
						var newRound = {};
						if (fields.length > 2){
							newRound = {
							    minutes: parseInt(fields[4]),
							    small: parseInt(fields[1]),
							    big: parseInt(fields[2]),
							    ante: parseInt(fields[3]),
							};
						}else{
							newRound = {
							    minutes: parseInt(fields[1]),
							    small: 0,
							    big: 0,
							    ante: 0,
							};
						}
						pokerClock.rounds.push(newRound);
					}
					console.log(pokerClock.rounds);
					pokerClock.showRounds();
					$('#roundEntry').html('');
		          	$( this ).dialog( "close" );
		        },
		        Clear:function(){
		        	$('#roundEntry').html('');
		        },
		        Cancel: function() {
		          $( this ).dialog( "close" );
		        }
	      	}
		});

		$('#addStructure').button().click(function(){
			var formatString ='';
			$('#roundEntry').html('');
			for(var i=0, len=pokerClock.rounds.length; i<len; i++){
				var round = pokerClock.rounds[i];
				formatString += i+1 + '\t' +round.small + '\t' +round.big + '\t' + round.ante + '\t' + round.minutes + '\n';
			}
			$('#roundEntry').html(formatString);
			$("#importStructureDialog").dialog('open');
		});
		$("#pauseButton").toggle(pokerClock.pauseCountdown, pokerClock.startCountdown).click();
		$("#soundButton").toggle(pokerClock.muteOn,pokerClock.muteOff).css({color:'green'});
		// $("#addRound").bind('click', pokerClock.addRound);
		// $("#addPlayer").bind('click', pokerClock.addPlayer);
		// $("#randomizeSeats").bind('click', pokerClock.randomizeSeats);
		$("#startRound").bind('click', function(){ pokerClock.startRound(pokerClock.currentRound) })
						.attr({title:'restart current round'});
		$(".nextRound").attr({title:'next round'})
					   .bind('click', function(){
			$('.timeLeft').removeClass('warning');
			if (pokerClock.currentRound < pokerClock.rounds.length - 1){
				if(!pokerClock.mute){pokerClock.pop.play()};
				pokerClock.currentRound++;
				pokerClock.startRound(pokerClock.currentRound) ;
				pokerClock.showRounds();
			}
		});
		$(".prevRound").attr({title:'previous round'})
					   .bind('click', function(){
							if (pokerClock.currentRound > 0){
								if(!pokerClock.mute){pokerClock.pop.play()};
								pokerClock.currentRound--;
								pokerClock.startRound(pokerClock.currentRound) ;
								pokerClock.showRounds();
							}
						});

		$(".extra").toggle(
			function(){
				$(this).hide();
			},
			function(){
				$(this).show();
			}
		).toggle().unbind('click');

		// $(".koButton").live('click', function(){
		// 	$(this).parent().parent().parent().parent().parent().parent().toggleClass('ko').find("input").toggleClass('ko');
		// 	var playerName = $(this).parent().parent().parent().parent().parent().parent().find("input").val();
		// 	pokerClock.logEvent(playerName +' knocked out' );

		// 	var activePlayers = $("tr.player").not("tr.ko").length;
		// 	pokerClock.updatePlayers();
		// 	if (activePlayers == 1){
		// 		$("tr.player").not("tr.ko").find("input").addClass('winner');
		// 		var winner = $("tr.player").not("tr.ko").find("input").val();
		// 		pokerClock.alertPlayers(winner + ' has won the tournament!');
		// 		pokerClock.logEvent(winner + ' has won the tournament!');
		// 	}

		// });
		$("#structure").change(function(){
			pokerClock.loadStructure($(this).val());
		});
		$("#payStructure").change(function(){
			pokerClock.loadPayStructure($(this).val());
		});
		// $("#addPayout").click( pokerClock.addPayout);
		// $("#delPayout").click( pokerClock.delPayout);
		$("#rounds input[type='text']").live('change', pokerClock.updateRounds);
		$("#players input[type='text']").live('change', pokerClock.updatePlayers);
		pokerClock.showStructures();
		pokerClock.showPayStructures();
		//initialize default structure
		pokerClock.loadStructure(0);
		pokerClock.loadPayStructure(0);

		$("#payouts input.poPercent").live('change', pokerClock.calculatePayoutDollars).change();
		//$("#players").tablesorter();
		$( "#tabs" ).tabs();

		$('button').live('mouseover',function(){
			$(this).addClass('ui-state-hover');
		}).live('mouseout',function(){
			$(this).removeClass('ui-state-hover');
		}).live('mousedown',function(){
			$(this).addClass('ui-state-active');
		}).live('mouseout',function(){
			$(this).removeClass('ui-state-active');
		});

		//bind keystrokes
		$(document).bind('keydown', bindKeys);

		$('#roundEntry').bind('focus', function(){
			$(document).unbind('keydown');
		});

		$('#roundEntry').bind('blur', function(){
			$(document).bind('keydown', bindKeys);
		});

		function bindKeys(e){
			var key = e.keyCode;
			console.log('key', key);
			if(key === 32){
				//e.preventDefault();
				$('#pauseButton').click();
				return true;
			} else if (key === 37){
				e.preventDefault();
				$('#prevRound').click();
			} else if (key === 39){
				e.preventDefault();
				$('#nextRound').click();
			}else{
				return true;
			}
		}

	},
	cfg : {
		debug: false
	},
	warning : new Audio("/snd/flint.wav"),
	pop : new Audio("/snd/pop.wav"),
	alert : new Audio("/snd/alert.wav"),
	currentRound : 0,
	nextRound : function(){

		this.currentRound++;
		return this.currentRound;
	},
	alertPlayers :function(msg){
		$("#alertBox").html(msg).dialog('open');
	},
	mute : false,
	muteOn : function(){
		pokerClock.mute = true;
		chrome.tts.stop();
		$("#soundButton").css({color:'red'}).attr({title:'sound disabled'});

	},
	muteOff : function(){
		pokerClock.mute = false;
		pokerClock.pop.play();
		$("#soundButton").css({color:'green'}).attr({title:'sound enabled'});

	},
	timeInterval : 0,
	logEvent : function(msg){
		$("#events ul").append( '<li>'+  pokerClock.getTime() + ' ' + msg +'</li>');
	},
	countdownInterval : 0,
	startClock : function(){
		pokerClock.timeInterval = setInterval( function(){pokerClock.showTime()}, 1000);
		$(".timeLeft").removeClass('paused');
		$(this).html('pause');
	},
	startCountdown : function(){
		if(!pokerClock.mute){
			pokerClock.pop.play();
			chrome.tts.speak('Clock running.', {'enqueue': true})
		};
		pokerClock.countdownInterval = setInterval( function(){pokerClock.showCountdown()}, 1000);
		$(".timeLeft").removeClass('paused');
		$(this).html('pause clock').attr({'title':'pause clock'});
		pokerClock.logEvent('clock unpaused');
	},
	pauseCountdown : function(){

		if(!pokerClock.mute){
			pokerClock.pop.play();
			chrome.tts.speak('Clock paused.', {'enqueue': true})
		};
		pokerClock.logEvent('clock paused');
		clearInterval(pokerClock.countdownInterval);
		$(".timeLeft").addClass('paused');
		$("#tabs li:nth-child(2) a").addClass('paused');
		$(this).html('start clock').attr({'title':'start clock'});
	},
	emptyRounds : function(){
		pokerClock.rounds = [];
		pokerClock.currentRound = 0;
		pokerClock.showRounds();
	},
	updateRounds :  function(){
		//alert('updating');
		pokerClock.rounds = [];
		$("#rounds tr.rounds").each(function(){
			var min = $(this).find(".minutes").val();
			var small = $(this).find(".small").val();
			var big = $(this).find(".big").val();
			var ante = $(this).find(".ante").val();
			var round = {minutes: min, small: small, big: big, ante : ante};
			pokerClock.rounds.push(round);
		});
		pokerClock.showRounds();
		$(this).select();
	},

	startRound : function(roundIndex){
		var round = pokerClock.rounds[roundIndex];
		var nextRound = pokerClock.rounds[roundIndex + 1];
		if(!pokerClock.mute){

			if(round.small > 0 && round.big > 0){

				chrome.tts.speak('Blinds are ' +round.small +' dollar small blind. And '+ round.big + ' dollar big blind.', {'enqueue': false});

				if(round.ante > 0 ){
					chrome.tts.speak('There is a '+ round.ante + ' dollar ante.', {'enqueue': true});
				}
				chrome.tts.speak('Shuffle up and deal!', {'enqueue': true})
			}else{
				chrome.tts.speak('Break time for ' + round.minutes + 'minutes.');
			}

		}
		pokerClock.secondsLeft = (round.minutes * 60) ;
		$("#roundInfo").html(round.small + '/' + round.big);
		if(round.ante > 0){ $("#roundInfo").append('(' + round.ante +')'); }
		if(round.small == 0 && round.big == 0 && round.ante == 0){ $("#roundInfo").html('on break'); }

		if( typeof pokerClock.rounds[roundIndex + 1] != 'undefined'){
			$("#next").html('next round:' + nextRound.small + '/' + nextRound.big);
			if(nextRound.ante > 0){ $("#next").append('(' + nextRound.ante +')'); }
			if(nextRound.small == 0 && nextRound.big == 0 && nextRound.ante == 0){ $("#next").html('next round: on break'); }
		}
		$('.timeLeft').effect('shake', {}, 100);
	},
	showRounds : function(){
		$("#rounds tr.rounds").remove();
		for (r=0; r< pokerClock.rounds.length; r++){

			$("#rounds").append(
				'<tr class="rounds">'+
				'<td class="rounds"><input disabled="disabled" type="text" class="text minutes" value="' + pokerClock.rounds[r].minutes + '"/></td>' +
				'<td class="rounds small"><input disabled="disabled" type="text" class="text small" value="' + pokerClock.rounds[r].small + '"/></td>' +
				'<td class="rounds big"><input disabled="disabled" type="text" class="text big" value="' + pokerClock.rounds[r].big + '"/></td>' +
				'<td class="rounds"><input type="text" disabled="disabled" class="text ante" value="' + pokerClock.rounds[r].ante + '"/></td>' +
				'</tr>'
			);
		}
		$("#rounds tr").slice(1 ,pokerClock.currentRound +2).children().addClass('past').children().addClass('past');
		$("#rounds tr").slice(pokerClock.currentRound +1 , pokerClock.currentRound +2).children().addClass('current').children().addClass('current');
		$("tr.rounds").each(function(){
			var $row = $(this),
			big,small;
			var big = $row.children('td.big').each(function(){
				big = $(this).children('input.big').val();
			});
			var small = $row.children('td.small').each(function(){
				small = $(this).children('input.small').val();
			});
			if(big == 0 && small == 0){
				$row.addClass('break');
			}


		});
	},
	secondsLeft : 65,
	setCountdown: function(){
		pokerClock.secondsLeft = minutes * 60;

	},
	endLevel : function(){

		$('.timeLeft').effect('pulsate',{times:8},'slow');
		$("#nextRound").click();
		$('.timeLeft').removeClass('warning');
	},
	showCountdown : function(){
		var hours, minutes, seconds;
		pokerClock.secondsLeft --;
		if (pokerClock.secondsLeft < 1 ){
			pokerClock.endLevel();
		}
		hours = parseInt(pokerClock.secondsLeft / 3600);
		var timeLeft = (pokerClock.secondsLeft  %  3600);
		if (timeLeft){
			minutes = parseInt(timeLeft  /  60);
			timeLeft = parseInt(timeLeft %  60);

			if(minutes === 1 && timeLeft == 0){
				if(!pokerClock.mute){
					pokerClock.alert.play();
					setTimeout(function(){
						chrome.tts.speak('One minute left in round');
					}, 3000);
				};
				$('.timeLeft').effect('pulsate',{times:8},'slow').addClass('warning');
			}

			if (minutes < 10){ minutes = "0" + minutes; }
		}
		seconds = timeLeft;

		if(hours == 0 & minutes == 0 &seconds == 3){
			if(!pokerClock.mute){pokerClock.warning.play()};
		}


		if(seconds < 0 ){
			seconds = 0;
			clearInterval(pokerClock.countdownInterval);
		}
		if (seconds < 10){ seconds = "0" + seconds; }
		if (! minutes){minutes = "00"; };
		$("div.timeLeft").html(hours +':'+minutes + ':' + seconds);
		$("#tabs li:nth-child(1) a").html(hours +':'+minutes + ':' + seconds);

	},
	getTime : function(){
		var clock = new Date();
		var hours = clock.getHours();
		var minutes = clock.getMinutes();
		return hours +':'+ minutes;

	},
	showTime : function(){
		var clock = new Date();
		var hours = clock.getHours();
		var suffix = 'am';
		if (hours > 11){suffix='pm'};
		if (hours > 12){
			hours = hours - 12;
		}else if(hours == 0){
			hours = 12;
		}
		var minutes = clock.getMinutes();
		if (minutes < 10){ minutes = "0" + minutes; }
		var seconds = clock.getSeconds();
		if (seconds < 10){ seconds = "0" + seconds; }
		$(".clock").html(hours + ':' + minutes + suffix );
	},
	rounds : [ ],
	defaultRound : {minutes: 20, small: 25, big: 50, ante: 0},
	defaultPlayer : {name: 'new player', buyIn: 20, chips: 2000, seat: 0, ko: false},
	players : [ ],
	addPlayer : function(){
		var num = parseInt($(".numPlayers").val());
		var buyin =$("#buyin").val();
		var chips =$("#chips").val();
		for(var i = 0; i < num; i++){
			//var p = jQuery.extend({}, pokerClock.defaultPlayer);
			var p = {'buyIn':buyin, 'chips':chips};
			p.name = 'player ' + (pokerClock.players.length + 1);
			pokerClock.players.push(p);
		}
		pokerClock.randomizeSeats();

	},
	showPlayers : function(){
		$("#players tbody").remove();
		var totalBuyIn = 0;
		var totalChips = 0;
		var numPlayers = pokerClock.players.length;
		var rowString;
		for(var i in pokerClock.players){
			if (pokerClock.players[i].ko === true){
				rowString = '<tr class="player ko ">';
			}else{
				rowString = '<tr class="player">';
			}
			var rowString =
					rowString +
					'<td class="player seat">'+pokerClock.players[i].seat +'</td>' +
					'<td><input class="player playerName" type="text" value="'+ pokerClock.players[i].name + '"></input></td>'+
					'<td><input class="player text buyIn" type="text" value="'+ pokerClock.players[i].buyIn + '"></input></td>'+
					'<td><input class="player text chips" type="text" value="'+ pokerClock.players[i].chips + '"></input></td>'+
					'<td class="player cmd">' +
						'<table><tr><td>' +
						'<button title="knock out player"  class="koButton ui-state-default" >ko</button> ' +
						'</td>'+
						'<td><button title="rebuy" class="rebuy ui-state-default">rebuy</button> </td>'+
						'<td><button title="rebuy" class="addon ui-state-default">add</button> </td>'+
						'<td><button title="delete player"  class="delPlayer ui-state-default" >x</button> ' +
						'</td></tr>'+
					'</td>'+
				'</tr>';
			$("#players").append(rowString);
			if(pokerClock.players[i].ko === true){
				$("#players tbody tr.ko").find("input").addClass('ko');
			}
			totalBuyIn += parseInt(pokerClock.players[i].buyIn );
			totalChips += parseInt(pokerClock.players[i].chips);
		}
		var activePlayers = $("tr.player").not("tr.ko").length;
		$(".playersLeft").html(activePlayers);
		//alert(activePlayers);
		$(".avgStack").html(parseInt(totalChips / activePlayers));
		$("#pot").html(totalBuyIn);
		$("#totalChips").html(totalChips);
		$("#players").trigger("update");
		$(".poPercent").change();
	},

	updatePlayers :  function(){
		pokerClock.players = [];
		$("#players tr.player").each(function(){
			var name = $(this).find(".playerName").val();
			var buyIn = $(this).find(".buyIn").val();
			var chips = $(this).find(".chips").val();
			var seat = $(this).find(".seat").html();
			var ko = false;
			if($(this).hasClass('ko')){
				ko = true;
			}
			var player = {'name': name, 'buyIn': buyIn, 'chips': chips, 'seat' : seat, 'ko' : ko};
			pokerClock.players.push(player);
		});
		pokerClock.showPlayers();
		$(this).select();
	},
	randomizeSeats : function(){
		var seatIndex = pokerClock.players.length ;
		var seats = [];
		for (var i = 1; i <=seatIndex;i++){
			seats.push(i);
		}
		for (var i in pokerClock.players){
			pokerClock.players[i].seat = seats.sort(pokerClock.randomSort).pop();
		}
		pokerClock.showPlayers();
	},
	randomSort : function(a,b){
		return( parseInt( Math.random()*10 ) %2 );
	},
	defaultPayout : { percent: 100, dollars : 0},
	payouts : [ ],
	showPayouts : function(){
		$("#payouts tbody tr").remove();
		for( i in pokerClock.payouts){
			var rowString = '<tr class="payout">' +
				'<td>&nbsp;'+(parseInt( i) + 1) +'&nbsp; </td>' +
				'<td class="payout"><input type="text" value="' + pokerClock.payouts[i].percent + '" class="poPercent"/></td>' +
				'<td class="payout"><input type="text" value="' + pokerClock.payouts[i].dollars + '" class="poDollars" readonly/></td>' +
				'</tr>';
			$("#payouts tbody").append(rowString);
		}
		$(".poPercent").change();
	},
	addPayout : function(){
		if (pokerClock.payouts.length < pokerClock.players.length ){
			pokerClock.payouts.push(pokerClock.defaultPayout);
			pokerClock.showPayouts();
			$(".poPercent").change();
		}
	},
	delPayout : function(){
		if (pokerClock.payouts.length > 1){
			pokerClock.payouts.pop();
			pokerClock.showPayouts();
			$(".poPercent").change();
		}
	},
	calculatePayoutDollars : function(){
		var pot = parseFloat($("#pot").html());
		var percent = $(this).attr('value') * .01;
		var payout = (pot * percent);
		$(this).parent().parent().find(".poDollars").val(payout);
		var totalPercent = 0;
		$(".poPercent").each(function(){
			totalPercent += parseInt( $(this).val());
		});
		if(totalPercent == 100){
			$("td.payout input").removeClass('over under').addClass('winner');
		}else if(totalPercent > 100) {
			$("td.payout input").removeClass('under winner').addClass('over');
		}else if (totalPercent < 100){
			$("td.payout input").removeClass('over winner').addClass('under');
		}
		pokerClock.payouts = [];
		$("tr.payout").each(function(){
			var percent = $(this).find("input.poPercent").val();
			pokerClock.payouts .push({'percent':percent});
		});
	},
	loadStructure : function(sIndex) {
		pokerClock.rounds = pokerClock.structures[sIndex].rounds;
		pokerClock.currentRound = 0;
		pokerClock.startRound(pokerClock.currentRound);
		pokerClock.showPayouts();
		pokerClock.showRounds();
	},

	loadPayStructure : function(sIndex) {
		pokerClock.payouts = pokerClock.payStructures[sIndex].payouts;
		 //	alert(sIndex);
		pokerClock.showPayouts();
	},
	showPayStructures : function(){
		for(i in pokerClock.payStructures){
			var optString = '<option value="'+i+'">' + pokerClock.payStructures[i].name + '</option>';
			$("#payStructure").append(optString);
		}
	},
	showStructures : function(){
		for(i in pokerClock.structures){
			var optString = '<option value="'+i+'">' + pokerClock.structures[i].structureName + '</option>';
			$("#structure").append(optString);
		}
	},
	structures :
	[
		//begin structure
		{
			structureName : 'Sit & Go without antes - 1,500 chips',
			rounds :
			[
				{minutes: 10, small: 10, big: 20, ante: 0},
				{minutes: 10, small: 15, big: 30, ante: 0},
				{minutes: 10, small: 25, big: 50, ante: 0},
				{minutes: 10, small: 50, big: 100, ante: 0},
				{minutes: 10, small: 75, big: 150, ante: 0},
				{minutes: 10, small: 100, big: 200, ante: 0},
				{minutes: 5, small: 0, big: 0, ante: 0},
				{minutes: 10, small: 100, big: 200, ante: 0},
				{minutes: 10, small: 200, big: 400, ante: 0},
				{minutes: 10, small: 300, big: 600, ante: 0},
				{minutes: 10, small: 400, big: 800, ante: 0},
				{minutes: 10, small: 600, big: 1200, ante: 0},
				{minutes: 10, small: 800, big: 1600, ante: 0},
				{minutes: 5, small: 0, big: 0, ante: 0},
				{minutes: 10, small: 1000, big: 2000, ante: 0},
				{minutes: 10, small: 1500, big: 3000, ante: 0},
				{minutes: 10, small: 2000, big: 4000, ante: 0},
				{minutes: 10, small: 2500, big: 5000, ante: 0},
				{minutes: 10, small: 3000, big: 6000, ante: 0},
				{minutes: 10, small: 3500, big: 7000, ante: 0},
				{minutes: 10, small: 4000, big: 8000, ante: 0}
			]
		},
		//begin structure
		{
			structureName : 'Sit & Go with antes - 1,500 chips',
			rounds :
			[
				{minutes: 10, small: 10, big: 20, ante: 0},
				{minutes: 10, small: 15, big: 30, ante: 0},
				{minutes: 10, small: 25, big: 50, ante: 0},
				{minutes: 10, small: 50, big: 100, ante: 0},
				{minutes: 10, small: 75, big: 150, ante: 0},
				{minutes: 10, small: 100, big: 200, ante: 0},
				{minutes: 5, small: 0, big: 0, ante: 0},
				{minutes: 10, small: 100, big: 200, ante: 25},
				{minutes: 10, small: 200, big: 400, ante: 25},
				{minutes: 10, small: 300, big: 600, ante: 50},
				{minutes: 10, small: 400, big: 800, ante: 50},
				{minutes: 10, small: 600, big: 1200, ante: 75},
				{minutes: 10, small: 800, big: 1600, ante: 75},
				{minutes: 5, small: 0, big: 0, ante: 0},
				{minutes: 10, small: 1000, big: 2000, ante: 100},
				{minutes: 10, small: 1500, big: 3000, ante: 150},
				{minutes: 10, small: 2000, big: 4000, ante: 150},
				{minutes: 10, small: 2500, big: 5000, ante: 200},
				{minutes: 10, small: 3000, big: 6000, ante: 200}
			]
		},
		//begin structure
		{
			structureName : 'Home Game Standard with antes',
			rounds :
			[
				{minutes: 20, small: 25, big: 25, ante: 0},
				{minutes: 20, small: 25, big: 50, ante: 0},
				{minutes: 20, small: 50, big: 100, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 75, big: 150, ante: 0},
				{minutes: 20, small: 100, big: 200, ante: 25},
				{minutes: 20, small: 200, big: 400, ante: 25},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 300, big: 600, ante: 50},
				{minutes: 20, small: 400, big: 800, ante: 50},
				{minutes: 20, small: 500, big: 1000, ante: 50},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 600, big: 1200, ante: 100},
				{minutes: 20, small: 800, big: 1600, ante: 100},
				{minutes: 20, small: 1000, big: 2000, ante: 200},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 2000, big: 4000, ante: 300},
				{minutes: 20, small: 3000, big: 6000, ante: 400},
				{minutes: 20, small: 4000, big: 8000, ante: 500},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 5000, big: 10000, ante: 600},
				{minutes: 20, small: 6000, big: 12000, ante: 700},
				{minutes: 20, small: 7000, big: 14000, ante: 800},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 8000, big: 16000, ante: 900},
				{minutes: 20, small: 9000, big: 18000, ante: 1000}
			]
		},
		//begin structure
		{
			structureName : 'Home Game Standard without antes',
			rounds :
			[
				{minutes: 20, small: 25, big: 25, ante: 0},
				{minutes: 20, small: 25, big: 50, ante: 0},
				{minutes: 20, small: 50, big: 100, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 75, big: 150, ante: 0},
				{minutes: 20, small: 100, big: 200, ante: 0},
				{minutes: 20, small: 200, big: 400, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 300, big: 600, ante: 0},
				{minutes: 20, small: 400, big: 800, ante: 0},
				{minutes: 20, small: 500, big: 1000, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 600, big: 1200, ante: 0},
				{minutes: 20, small: 800, big: 1600, ante: 0},
				{minutes: 20, small: 1000, big: 2000, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 2000, big: 4000, ante: 0},
				{minutes: 20, small: 3000, big: 6000, ante: 0},
				{minutes: 20, small: 4000, big: 8000, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 5000, big: 10000, ante: 0},
				{minutes: 20, small: 6000, big: 12000, ante: 0},
				{minutes: 20, small: 7000, big: 14000, ante: 0},
				{minutes: 10, small: 0, big: 0, ante: 0},
				{minutes: 20, small: 8000, big: 16000, ante: 0},
				{minutes: 20, small: 9000, big: 18000, ante: 0}
			]
		},
		//Begin structure
		{
			structureName : 'Professional with antes',
			rounds :
			[
				{minutes: 30, small: 25, big: 50, ante: 0},
				{minutes: 30, small: 50, big: 100, ante: 0},
				{minutes: 30, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 100, big: 200, ante: 25},
				{minutes: 30, small: 150, big: 300, ante: 25},
				{minutes: 30, small: 200, big: 400, ante: 50},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 300, big: 600, ante: 75},
				{minutes: 30, small: 400, big: 800, ante: 100},
				{minutes: 30, small: 600, big: 1200, ante: 100},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 800, big: 1600, ante: 200},
				{minutes: 30, small: 1000, big: 2000, ante: 300},
				{minutes: 30, small: 1500, big: 3000, ante: 400},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 2000, big: 4000, ante: 500},
				{minutes: 30, small: 3000, big: 6000, ante: 500},
				{minutes: 30, small: 4000, big: 8000, ante: 1000},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 6000, big: 12000, ante: 1000},
				{minutes: 30, small: 8000, big: 16000, ante: 2000},
				{minutes: 30, small: 10000, big: 20000, ante: 3000},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 15000, big: 30000, ante: 4000},
				{minutes: 30, small: 20000, big: 40000, ante: 5000},
				{minutes: 30, small: 30000, big: 60000, ante: 5000}
			]
		},
		//Begin structure
		{
			structureName : 'Professional without antes',
			rounds :
			[
				{minutes: 30, small: 25, big: 50, ante: 0},
				{minutes: 30, small: 50, big: 100, ante: 0},
				{minutes: 30, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 150, big: 300, ante: 0},
				{minutes: 30, small: 200, big: 400, ante: 0},
				{minutes: 30, small: 300, big: 600, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 400, big: 800, ante: 0},
				{minutes: 30, small: 600, big: 1200, ante: 0},
				{minutes: 30, small: 800, big: 1600, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 1000, big: 2000, ante: 0},
				{minutes: 30, small: 1500, big: 3000, ante: 0},
				{minutes: 30, small: 2000, big: 4000, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 3000, big: 6000, ante: 0},
				{minutes: 30, small: 4000, big: 8000, ante: 0},
				{minutes: 30, small: 6000, big: 12000, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 8000, big: 16000, ante: 0},
				{minutes: 30, small: 10000, big: 20000, ante: 0},
				{minutes: 30, small: 15000, big: 30000, ante: 0},
				{minutes: 15, small: 0, big: 0, ante: 0},
				{minutes: 30, small: 20000, big: 40000, ante: 0},
				{minutes: 30, small: 30000, big: 60000, ante: 0},
				{minutes: 30, small: 40000, big: 80000, ante: 0}
			]

		},
		//begin structure
		{
			structureName : 'Empty Structure',
			rounds : [

				{minutes: 0, small: 0, big: 0, ante: 0},

			]
		},
		//end structure
	],
	payStructures :
	[
		{
			name: 'Pay 2',
			payouts: [
				{percent:65, dollars: 0},
				{percent:35, dollars: 0},
			]
		},
		{
			name: 'Pay 3',
			payouts: [
				{percent:50, dollars: 0},
				{percent:30, dollars: 0},
				{percent:20, dollars: 0},
			]
		},
		{
			name: 'Pay 4',
			payouts: [
				{percent:45, dollars: 0},
				{percent:25, dollars: 0},
				{percent:18, dollars: 0},
				{percent:12, dollars: 0},
			]
		},
		{
			name: 'Pay 5',
			payouts: [
				{percent:40, dollars: 0},
				{percent:23, dollars: 0},
				{percent:16, dollars: 0},
				{percent:12, dollars: 0},
				{percent:9, dollars: 0},
			]
		},
		{
			name: 'Pay 6',
			payouts: [
				{percent:38, dollars: 0},
				{percent:22, dollars: 0},
				{percent:15, dollars: 0},
				{percent:11, dollars: 0},
				{percent:8, dollars: 0},
				{percent:6, dollars: 0},
			]
		},
		{
			name: 'Pay 7',
			payouts: [
				{percent:35, dollars: 0},
				{percent:21, dollars: 0},
				{percent:15, dollars: 0},
				{percent:11, dollars: 0},
				{percent:8, dollars: 0},
				{percent:6, dollars: 0},
				{percent:4, dollars: 0},
			]
		},
		{
			name: 'Pay 8',
			payouts: [
				{percent:33, dollars: 0},
				{percent:20, dollars: 0},
				{percent:15, dollars: 0},
				{percent:11, dollars: 0},
				{percent:8, dollars: 0},
				{percent:6, dollars: 0},
				{percent:4, dollars: 0},
				{percent:3, dollars: 0},
			]
		},
		{
			name: 'Pay 9',
			payouts: [
				{percent:32, dollars: 0},
				{percent:20, dollars: 0},
				{percent:14, dollars: 0},
				{percent:11, dollars: 0},
				{percent:8, dollars: 0},
				{percent:6, dollars: 0},
				{percent:4, dollars: 0},
				{percent:3, dollars: 0},
				{percent:2, dollars: 0},
			]
		}
	]

};
