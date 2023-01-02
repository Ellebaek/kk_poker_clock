$(function () { pokerClock.init(); });

var pokerClock = {
	init : function(){
		$("#alertBox").dialog({ autoOpen: false, modal: true, width:300, height:200, show: 'blind', hide: 'blind'});

		$("#importStructureDialog").dialog({
			autoOpen: false,
			modal: true,
			width:500,
			height:600,
			show: 'blind',
			hide: 'blind',
			buttons: {
		        "Import": function() {
		        	var roundsString = $('#roundEntry').val();
					var rounds = roundsString.split(/\n/);
					pokerClock.rounds = [];
					for(var i=0, len=rounds.length; i<len; i++){
						var round = rounds[i];

						var fields = round.split(/\s+/);
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
					//console.log(pokerClock.rounds);

					pokerClock.showRounds();
					pokerClock.startRound(pokerClock.currentRound);
					//pokerClock.updateRounds();
					//pokerClock.loadStructure($("#structure").val());
					$('#roundEntry').html('');
		          	$( this ).dialog( "close" );
		        },
		        //Clear:function(){
		        //	$('#roundEntry').html('');
		        //},
		        Cancel: function() {
		          $( this ).dialog( "close" );
		        }
	      	}
		});

		$('#addStructure').button().click(function(){
			var formatString ='';
			$('#roundEntry').val('');
			for(var i=0, len=pokerClock.rounds.length; i<len; i++){
				var round = pokerClock.rounds[i];
				//formatString += i+1 + '\t' + round.small + '\t' +round.big + '\t' + round.ante + '\t' + round.minutes + '\n';
				formatString += (i+1).toString().padEnd(3, " ") + round.small.toString().padStart(8, " ") + round.big.toString().padStart(8, " ") + round.ante.toString().padStart(6, " ") + round.minutes.toString().padStart(4, " ");
				if (i<len-1){
					formatString += '\n';
				}
			}
			$('#roundEntry').val(formatString); // .html(formatString);
			$("#importStructureDialog").dialog('open');
		});
		$("#pauseButton").toggle(pokerClock.pauseCountdown, pokerClock.startCountdown).click();
		$("#soundButton").toggle(pokerClock.muteOn,pokerClock.muteOff).css({color:'green'});

		$("#startRound").bind('click', function(){
			if(!pokerClock.mute){pokerClock.pop.play()};
			pokerClock.startRound(pokerClock.currentRound);
		}).attr({title:'restart current round'});

		$(".nextRound").attr({title:'next round'})
					   .bind('click', function(){
			$('.timeLeft').removeClass('warning');
			if (pokerClock.currentRound < pokerClock.rounds.length - 1){
				if(!pokerClock.mute){pokerClock.pop.play()};
				pokerClock.currentRound++;
				pokerClock.startRound(pokerClock.currentRound);
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

		$("#structure").change(function(){
			pokerClock.loadStructure($(this).val());
		});

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
			//console.log('key', key);
			if(key === 38 || key === 40){
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

		pokerClock.showStructures();
		pokerClock.loadStructure(1);
		$('#structure').prop('selectedIndex', 1);
	},
	cfg : {
		debug: false
	},
	pop : new Audio("/clock/snd/pop.wav"),
	alert : new Audio("/clock/snd/alert.wav"),
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
		if(!pokerClock.mute){pokerClock.pop.play()};
		pokerClock.countdownInterval = setInterval( function(){pokerClock.showCountdown()}, 1000);
		$(".timeLeft").removeClass('paused');
		$(this).html('pause clock').attr({'title':'pause clock'});
		pokerClock.logEvent('clock unpaused');
	},
	pauseCountdown : function(){
    if(!pokerClock.mute){pokerClock.pop.play()};
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
	//updateRounds :  function(){
		//alert('updating');
	//	console.log("updateRounds called");
	//	pokerClock.rounds = [];
	//	$("#rounds tr.rounds").each(function(){
	//		var min = $(this).find(".minutes").val();
	//		var small = $(this).find(".small").val();
	//		var big = $(this).find(".big").val();
	//		var ante = $(this).find(".ante").val();
	//		var round = {minutes: min, small: small, big: big, ante : ante};
	//		pokerClock.rounds.push(round);
	//	});
	//	pokerClock.showRounds();
	//	$(this).select();
  //},

	startRound : function(roundIndex){
		//console.log("startRound called, roundIndex=" + roundIndex);
		var round = pokerClock.rounds[roundIndex];
		var nextRound = pokerClock.rounds[roundIndex + 1];
		pokerClock.secondsLeft = (round.minutes * 60) + 1 ;
		//console.log("sec=" + pokerClock.secondsLeft);
		if (roundIndex == 0) {
			pokerClock.showCountdown();
		}

		$("#roundInfo").html(round.small + '/' + round.big);
		if(round.ante > 0){ $("#roundInfo").append('(' + round.ante +')'); }
		if(round.small == 0 && round.big == 0 && round.ante == 0){ $("#roundInfo").html('on break'); }

		if( typeof pokerClock.rounds[roundIndex + 1] != 'undefined'){
			$("#next").html('next round:' + nextRound.small + '/' + nextRound.big);
			if(nextRound.ante > 0){ $("#next").append('(' + nextRound.ante +')'); }
			if(nextRound.small == 0 && nextRound.big == 0 && nextRound.ante == 0){ $("#next").html('next round: on break'); }
		}

		if (roundIndex > 0) {
			$('.timeLeft').effect('shake', {}, 100);
			pokerClock.showCountdown();
		}
	},
	showRounds : function(){
		//console.log("showRounds called");
		$("#rounds tr.rounds").remove();
		for (r=0; r< pokerClock.rounds.length; r++){

			$("#rounds").append(
				'<tr class="rounds">'+

				'<td class="rounds small"><input disabled="disabled" type="text" class="text small" value="' + pokerClock.rounds[r].small + '"/></td>' +
				'<td class="rounds big"><input disabled="disabled" type="text" class="text big" value="' + pokerClock.rounds[r].big + '"/></td>' +
				'<td class="rounds"><input type="text" disabled="disabled" class="text ante" value="' + pokerClock.rounds[r].ante + '"/></td>' +
				'<td class="rounds"><input disabled="disabled" type="text" class="text minutes" value="' + pokerClock.rounds[r].minutes + '"/></td>' +
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
	endLevel : function(){
		$("#nextRound").click();
		$('.timeLeft').removeClass('warning');
	},
	showCountdown : function(){
		//console.log("showCountdown called");
		//console.log("seconds:" + pokerClock.secondsLeft);
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

			if (minutes < 10){ minutes = "0" + minutes; }
		}
		seconds = timeLeft;

		if(hours == 0 & minutes == 0 & seconds == 1){
			if(!pokerClock.mute){pokerClock.alert.play()};
		}

		if (minutes == 0 & seconds <= 30){
			$('.timeLeft').addClass('warning');
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
	defaultRound : {minutes: 10, small: 100, big: 200, ante: 0},

	randomSort : function(a,b){
		return( parseInt( Math.random()*10 ) %2 );
	},
	loadStructure : function(sIndex) {
		pokerClock.rounds = pokerClock.structures[sIndex].rounds;
		pokerClock.currentRound = 0;
		pokerClock.startRound(pokerClock.currentRound);
		pokerClock.showRounds();
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
			structureName : 'Kings Club Turbo (1h) - 30,000 chips',
			rounds :
			[
				{minutes: 10, small: 100, big: 200, ante: 0},
				{minutes: 10, small: 300, big: 600, ante: 0},
				{minutes: 10, small: 500, big: 1000, ante: 0},
				{minutes: 10, small: 1000, big: 2000, ante: 0},
				{minutes: 10, small: 1500, big: 3000, ante: 0},
				{minutes: 5, small: 2500, big: 5000, ante: 0},
				{minutes: 5, small: 4000, big: 8000, ante: 0}
			]
		},
		//begin structure
		{
			structureName : 'Kings Club Fast (1.5h) - 30,000 chips',
			rounds :
			[
				{minutes: 10, small: 100, big: 200, ante: 0},
				{minutes: 10, small: 200, big: 400, ante: 0},
				{minutes: 10, small: 400, big: 800, ante: 0},
				{minutes: 10, small: 600, big: 1200, ante: 0},
				{minutes: 10, small: 800, big: 1600, ante: 0},
				{minutes: 10, small: 1000, big: 2000, ante: 0},
				{minutes: 10, small: 1500, big: 3000, ante: 0},
				{minutes: 10, small: 2500, big: 5000, ante: 0},
				{minutes: 10, small: 4000, big: 8000, ante: 0}
			]
		},
		//begin structure
		{
			structureName : 'Kings Club Medium (2h) - 30,000 chips',
			rounds :
			[
				{minutes: 10, small: 100, big: 200, ante: 0},
				{minutes: 10, small: 200, big: 400, ante: 0},
				{minutes: 10, small: 300, big: 600, ante: 0},
				{minutes: 10, small: 400, big: 800, ante: 0},
				{minutes: 10, small: 500, big: 1000, ante: 0},
				{minutes: 10, small: 600, big: 1200, ante: 0},
				{minutes: 10, small: 800, big: 1600, ante: 0},
				{minutes: 10, small: 1000, big: 2000, ante: 0},
				{minutes: 10, small: 1500, big: 3000, ante: 0},
				{minutes: 10, small: 2000, big: 4000, ante: 0},
				{minutes: 10, small: 3000, big: 6000, ante: 0},
				{minutes: 10, small: 4000, big: 8000, ante: 0}
			]
		},
		//begin structure
		{
			structureName : 'Kings Club Slow (3h) - 30,000 chips',
			rounds :
			[
				{minutes: 15, small: 100, big: 200, ante: 0},
				{minutes: 15, small: 200, big: 400, ante: 0},
				{minutes: 15, small: 300, big: 600, ante: 0},
				{minutes: 15, small: 400, big: 800, ante: 0},
				{minutes: 15, small: 500, big: 1000, ante: 0},
				{minutes: 15, small: 600, big: 1200, ante: 0},
				{minutes: 15, small: 800, big: 1600, ante: 0},
				{minutes: 15, small: 1000, big: 2000, ante: 0},
				{minutes: 15, small: 1500, big: 3000, ante: 0},
				{minutes: 15, small: 2000, big: 4000, ante: 0},
				{minutes: 15, small: 3000, big: 6000, ante: 0},
				{minutes: 15, small: 4000, big: 8000, ante: 0}
			]
		},
		//begin structure
		{
			structureName : 'Home Game Turbo with antes',
			rounds :
			[
				{minutes: 5, small: 15, big: 30, ante: 4},
				{minutes: 5, small: 25, big: 50, ante: 6},
				{minutes: 5, small: 35, big: 70, ante: 9},
				{minutes: 5, small: 50, big: 100, ante: 12},
				{minutes: 5, small: 75, big: 150, ante: 20},
				{minutes: 5, small: 100, big: 200, ante: 25},
				{minutes: 5, small: 125, big: 250, ante: 30},
				{minutes: 5, small: 150, big: 300, ante: 40},
				{minutes: 5, small: 200, big: 400, ante: 50},
				{minutes: 5, small: 250, big: 500, ante: 65},
				{minutes: 5, small: 300, big: 600, ante: 75},
				{minutes: 5, small: 350, big: 700, ante: 90},
				{minutes: 5, small: 400, big: 800, ante: 100},
				{minutes: 5, small: 500, big: 1000, ante: 125},
				{minutes: 5, small: 600, big: 1200, ante: 150},
				{minutes: 5, small: 700, big: 1400, ante: 175},
				{minutes: 5, small: 800, big: 1600, ante: 200},
				{minutes: 5, small: 1000, big: 2000, ante: 250},
				{minutes: 5, small: 1250, big: 2500, ante: 315},
				{minutes: 5, small: 1500, big: 3000, ante: 375},
				{minutes: 5, small: 2000, big: 4000, ante: 500},
				{minutes: 5, small: 2500, big: 5000, ante: 625},
				{minutes: 5, small: 3000, big: 6000, ante: 750},
				{minutes: 5, small: 3500, big: 7000, ante: 875},
				{minutes: 5, small: 4000, big: 8000, ante: 1000},
				{minutes: 5, small: 5000, big: 10000, ante: 1250}
			]
		},
		//begin structure
		{
			structureName : 'Empty Structure',
			rounds : [
				{minutes: 0, small: 0, big: 0, ante: 0},
			]
		}
	]
};
