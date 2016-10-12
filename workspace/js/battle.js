var base_attack_modifier = 10;

// battle two property json structs
function battle_cards( player_card, npc_card, callback )
{
    var player  = prepare_card( player_card );
    var npc     = prepare_card( npc_card );
    
    console.dir( player );
    console.dir( npc );
    
    // normalise speeds
    calculate_speed( player, npc );
    if( player.speed < npc.speed )
    {
        // EVENT: Player speed faster
        console.log( "Player goes first! Speed " + player.speed + " vs " + npc.speed  );
    }
    else if( npc.speed < player.speed ) 
    {
        // EVENT: NPC speed faster
        console.log( "Player goes second! Speed " + player.speed + " vs " + npc.speed  );
    }
    else
    {
        // EVENT: Speed matched 
        console.log( "Player goes first! Speed matched: " + player.speed  );
    }

    // calculate attacks
    calculate_attack( player, npc );
    calculate_attack( npc, player );
    
    var battle = {
        last_attack: '',
        // current_tick: 1, // start on 1 to match 1 based speed
        // max_tick: LCM([ player.speed, npc.speed ]), // Find lowest common multiple for turn loops
        attack_random: 0.2, // allow for up to +-50% difference on each attack, set to 0 to disable
        won_battle: false,
        turn: 1,
        complete: false,
        callback: callback
    }
    
    battle_on( battle, player, npc );
}

function battle_on( battle, player, npc )
{
    var player_attack_turn  = ( battle.turn % player.speed == 0 );
    var npc_attack_turn     = ( battle.turn % npc.speed == 0 );
    
    if( player_attack_turn )
    {
        take_turn( battle, player, npc );
    }
    if( npc_attack_turn && !battle.complete )
    {
        take_turn( battle, npc, player );
    }
    
    console.info( "TURN: Player HP: " + player.hp + " NPC HP: " + npc.hp  );
    
    battle.turn++;

    if( battle.complete )
    {
        clearTimeout( window.battleTimer );
        battle.callback();
    }
    else
    {
        window.battleTimer = setTimeout(function() { battle_on( battle, player, npc ) }, 3000)
    }
}

// Lets take a battle turn - card1 attack card2
function take_turn ( battle, card1, card2 )
{
    // Calculate potential attack randomizer
    var attack_random = 0;
    if( battle.attack_random > 0 )
    {
        var rand_attack_base = Math.round( card1.attack_total * battle.attack_random );
        attack_random = getRandomIntInclusive( 0, rand_attack_base*2 );
        attack_random -= rand_attack_base;
    }
    
    var total_turn_attack = attack_random + card1.attack_total;
    card2.hp -= total_turn_attack;
    var health_perc = ( card2.hp / card2.hp_total ) * 100;
    var health_class = deck_tooltip.calcClass( health_perc );
    // EVENT: ATTACK HITS!
    if( card1.player )
    {
        $('#player-card').addClass('attack');
        $('#cpu-card').addClass('hit');
        $('#cpu-health').addClass('beat');
        
        $('#cpu-health-remaining').width( health_perc + '%' );
        $('#cpu-health-remaining').removeClass( "bad neutral good perfect" ).addClass( health_class );
    }
    else
    {
        $('#cpu-card').addClass('attack');
        $('#player-card').addClass('hit');
        $('#player-health').addClass('beat');
        
        $('#player-health-remaining').width( health_perc + '%' );
        $('#player-health-remaining').removeClass( "bad neutral good perfect" ).addClass( health_class );
    }
    
    $('#cpu-card').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',   
        function(e) {
            $('#player-card').removeClass('attack hit');
            $('#cpu-card').removeClass('attack hit');
            $('#player-health').removeClass('beat');
    });
    
    console.log( "ATTACK! " + card1.full_card.name + " does " + total_turn_attack + " damage to " + card2.full_card.name + "with " + attack_random + " bonus turn attack" );
    
    // EVENT: DEAD CARD, WE HAVE A WEIINNNNNNNNEEERRRRRRRR
    if( card2.hp <= 0 )
    {
        console.info( "CARD " + card2.full_card.name  + " IS DEADDDDDDDD" );

        if( card1.player )
        {
            battle.won_battle = true; // This will be true if player won
            console.info( "PLAYERRR WINSSSS!!!!" );
        }
        else
        {
            battle.won_battle = false; // This will be true if player won
            console.info( "PLAYERRR LOSES :( :( :(" );
        }

        battle.complete = true;
    }
}

function calculate_attack( card1, card2 )
{
    card1.attack        = card1.guests * base_attack_modifier;
    card1.attack_bonus  = 0;
    card1.attack_total  = card1.attack;
    
    for ( var i in card1.battle_attributes )
    {
        var attribute = card1.battle_attributes[i];
        if( card1.attributes[attribute] > card2.attributes[attribute] )
        {
            // EVENT: Attack increased
            console.log( "Attribute bonus! " + attribute + " +" + base_attack_modifier );
            card1.attack_bonus += base_attack_modifier;
        }
        else if( card1.attributes[attribute] < card2.attributes[attribute] )
        {
            console.log( "Attribute failed! " + attribute + " has no effect ..." );
            // EVENT: Attack insufficient
        }
        else
        {
            console.log( "Attribute matched! " + attribute + " has no effect ..." );
            // EVENT: Attack neutral
        }
    }
    
    card1.attack_total += card1.attack_bonus;
    console.log( "Initial attack: " + card1.attack + " Bonuse: +" + card1.attack_bonus + " Final attack: " + card1.attack_total + "!!!" );
}

function prepare_card( card )
{
    return {
        id: card.id,
        guests: card.maxGuests,
        hp_total: card.tariff,
        hp: card.tariff,
        battle_attributes: [ 'bedrooms', 'bathrooms', 'parking' ],
        player: card.player,
        attributes: card.facilities,
        full_card: card,
    };
}

function calculate_speed( card1, card2 )
{
    // Normalize speeds
    var reduced_fraction = reduce( card1.guests, card2.guests );
    card1.speed = reduced_fraction[0];
    card2.speed = reduced_fraction[1]; 
    
}


// Reduce a fraction by finding the Greatest Common Divisor and dividing by it.
function reduce(numerator,denominator){
  var gcd = function gcd(a,b){
    return b ? gcd(b, a%b) : a;
  };
  gcd = gcd(numerator,denominator);
  return [numerator/gcd, denominator/gcd];
}

function LCM(A)  // A is an integer array (e.g. [-50,25,-45,-18,90,447])
{   
    var n = A.length, a = Math.abs(A[0]);
    for (var i = 1; i < n; i++)
     { var b = Math.abs(A[i]), c = a;
       while (a && b){ a > b ? a %= b : b %= a; } 
       a = Math.abs(c*A[i])/(a+b);
     }
    return a;
}

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}