window.MAPS_KEY = 'AIzaSyDoXZ0sL-wIuutEI6-9NQDKyzmIpzGmD6A';
window.images 	= ['Anchorage', 'Fingal_Bay', 'Nelson_Bay', 'Salamander_Bay', 'Shoal_Bay', 'Soldiers_Point', 'Winda_Woppa'];
window.markers  = [];

// averages across all properties
window.calculations = {
    maxGuests: 6.474211781330037,
    bedrooms: 2.882194357366771,
    parking: 1.5986538030065067,
    bathrooms: 1.7289032637459572,
    review_score: 4.3335,
    review_total: 1.757128810226155,
    tariff: 192.5022549138402,
};

// this is a card that shows up on screen
window.deck_tooltip = {
    obj: '#main-card',
    container: '#main-card .deck-container',
    button_container: '#main-card .tooltip-buttons',
    close_button: 'toggle-deck-tooltip',
    battle_button: 'battle-card',
    start_battle_button: 'start-battle',
    remove_button: 'remove-card',
    card: {},
    in_deck: false,
    labels: {
        maxGuests: "Guest",
        bedrooms: "Bedroom",
        bathrooms: "Bathroom",
        parking: "Car Space"
    },
    setObj: function( obj_string ) {
    	this.obj 				= obj_string;
    	this.container 			= obj_string + ' .deck-container';
    	this.button_container 	= obj_string + ' .tooltip-buttons';
    },
    resetObj: function() {
    	this.obj 				= '#main-card';
    	this.container 			= '#main-card .deck-container';
    	this.button_container 	= '#main-card .tooltip-buttons';
    },
	setCard: function( card ) {
		this.card 				= card;
	},
	build: function() {
	    var power_val = ( this.card.tariff / calculations.tariff ) * 100;
        var power_class = this.calcClass( power_val );
	    var html = '<a class="property-image-link" href="http://www.stayz.com.au/' + this.card.stayzId + '" target="_blank"> \
	    	<div class="property-image" style="background-image:url(' + this.card.images[0] + ');"> \
		    	<div class="overlay"> \
			    	<span class="overlay-message">View on Stayz</span> \
			  	</div> \
	    	</div></a> \
            <div class="property-details"> \
                <div class="power-container"> \
                    <h4>' + this.card.name + '</h4><div class="power ' + power_class + '">' + this.card.tariff + '</div> \
                </div> \
                <ul> \
                    ' + this.buildRow( 'maxGuests' ) + ' \
                    ' + this.buildRow( 'bedrooms' ) + ' \
                    ' + this.buildRow( 'bathrooms' ) + ' \
                    ' + this.buildRow( 'parking' ) + ' \
                </ul> \
            </div>';
	    
	    document.querySelector( this.container ).innerHTML = html;
	    
	    // show our battle buttons
	    var button_html = "";
	    if( this.in_deck )
	    {
	        button_html = '<div id="battle-card" class="battle"><a href="#" class="button">Let\'s Battle</a></div>';
	    }
	    else if( Object.keys( deck.getBattleCard() ).length )
	    {
	        button_html = '<div id="start-battle" class="start-battle"><a href="#" class="button">Battle</a></div>';
	    }
	    if( document.querySelector( this.button_container ) )
	    {
	    	document.querySelector( this.button_container ).innerHTML = button_html;	
	    }
	},
	calcClass: function( value ) {
	    var bar_class;
	    if( value <= 33 )
	        bar_class = 'bad';
	    else if( value <= 66 )
	        bar_class = 'neutral';
	    else if( value < 100 )
	        bar_class = 'good';
	    else if( value >= 100 )
	        bar_class = 'perfect';
	        
	       return bar_class;
	},
	buildRow: function( index ) {
	    var label       = this.labels[ index ] + ( this.card[ index ] == 1 ? '' : 's' );
	    var width       = ( this.card[ index ] / calculations[ index ] ) * 100;
        var bar_class   = this.calcClass( width );
	    
	    var html = '<li><strong>' + ( this.card[ index ] || 0 ) + '</strong> ' + label + '</li> \
                    <li> \
                        <div class="bar"> \
                            <div class="bar-fill ' + bar_class + '" style="width:' + width + '%;"></div> \
                        </div> \
                    </li> \
	    ';
	    
	    return html;
	},
	battle: function() {
	    populateMap(); // add pins to the map
	    deck.setBattleCard( deck_tooltip.card ); // mark the card as ready to battle
	    deck.rebuild();
	    deck_tooltip.destroy();
	},
	start_battle: function() {
	    var player_card = deck.getBattleCard();
	    var npc_card    = deck_tooltip.card;
	    
	    player_card.player = true;
	    
	    if( player_card && npc_card )
	    {
	    	deck_tooltip.destroy();
	    	generateArena( player_card, npc_card );
	    	battle_cards( player_card, npc_card, function() {
	            if( this.won_battle ) // winner winner chicken dinner
	            {
	                deck.addCard( npc_card );
	                deck.rebuild();
	                alert( 'You Win' );
	            }
	            else
	            {
	                alert( 'You Lose' );
	            }
	            
	            deck_tooltip.resetObj();
	            clearArena();
	    	});
	    }
	},
	remove: function() { // remove a property from the deck
	    if( confirm( "Are you sure you wish to remove this property?" ) )
	    {
    	    deck.removeProperty( deck_tooltip.card.code );
    	    deck_tooltip.destroy();
	    }
	},
	destroy: function() {
	    this.hide();
	    this.container.innerHTML = null;
	    this.setCard( null );
	},
	show: function( card, add_to_deck, in_deck ) {
	    if( card ) // setter
	    {
	        this.setCard( card );
	        
	        if( add_to_deck ) // new card
	        {
	            deck.init( card ); // initialise the deck
	        }
	    }
	    
	    if( this.card )
	    {
	        this.in_deck = ( add_to_deck || in_deck ); // we already have the card in the deck
	        this.build();
	        document.querySelector( this.obj ).style.display = 'block';
	        
	        // click event handlers
	        if(this.obj === "#first-property-card")
	        {	
	        	console.log("Setting close handler for first_property_display"); 
   		        document.getElementById( 'toggle-first-property' ).addEventListener('click', window.first_property_display.hide, false);
	        }
	        else
	        {
		        document.getElementById( this.close_button ).addEventListener('click', this.hide, false);
	        }
	        if( document.getElementById( this.remove_button ) )
	        {
	            //document.getElementById( this.remove_button ).addEventListener('click', this.remove, false);
	        }
	        if( document.getElementById( this.battle_button ) )
	        {
	            document.getElementById( this.battle_button ).addEventListener('click', this.battle, false);
	        }
	        if( document.getElementById( this.start_battle_button ) )
	        {
	            document.getElementById( this.start_battle_button ).addEventListener('click', this.start_battle, false);
	        }
	    }
	},
	hide: function() {
	    document.querySelector( deck_tooltip.obj ).style.display = 'none';
	}
};

// our deck of cards/properties
window.deck = {
    obj: '.deck',
    list: '.card-list',
    card: '.deck-property',
    close: 'toggle-deck',
    score_id: 'score',
    expanded: true,
    score: 0,
    battle_card: {},
	cards: [],
	init: function( card ) {
	    if( card ) // set a card
	    {
	        this.addCard( card );
	    }
	    else if(window.properties && window.properties.constructor === Array && window.properties.length > 0) // Choose an initial card at random
	    {
		    var i = Math.floor(Math.random() * window.properties.length);
		    this.addCard(window.properties[i]);
	    }
	    else
	    {
	    	console.log("Initialised deck is empty");	
	    }
	    document.querySelector( '.days-left' ).style.display = 'block';
	    document.getElementById( this.close ).addEventListener('click', this.toggle, false);
	    
	    this.show();
	},
	toggle: function() { // toggle the opening and closing of the deck - open by default
	    var $deck = $( deck.obj );
        $deck.toggleClass('expanded');
	    deck.expanded = !deck.expanded;
        
        ( deck.expanded )
            ? $deck.css("bottom","50px")
            : $deck.css("bottom","-100px");
        $( '#' + deck.close ).children('.fa').toggleClass('fa-plus fa-times');  
	},
	setBattleCard: function( card ) { // the card for the next battle
		this.battle_card = card;
	},
	getBattleCard: function() {
		return this.battle_card;
	},
	addCards: function( cards ) { // add a set of cards
		var _this = this;
	    cards.forEach(function( card ) {
            _this.addCard( card );
        });
	},
	addCard: function( card ) { // add a card to the deck - you should rebuild or append afterwards
		this.cards.push( card );
	},
	rebuild: function() { // rebuild the display
	    var _this = this;
	    this.clearCards();
	    var total = 0;
	    this.cards.forEach(function( card ) {
            _this.append( card );
            total += Number( card.tariff );
        });
        
        this.setScore( total );
        
        localStorage.setItem( "ybi.holiday_bash.cards", JSON.stringify( this.cards ) );
        
        this.setClickHandler();
	},
	append: function( card ) {
	    var active = "";
	    if( card.id == this.battle_card.id )
	    {
	        active = "active";
	    }
	    document.querySelector( this.list ).innerHTML += ( '<li><div class="deck-property ' + active + '" data-propertyid="' + card.id + '" style="background-image:url(' + card.images[0] + ');"></div></li>' );
	},
	calcScore: function() {
		var total = 0;
		this.cards.forEach(function( card ) {
		  total += Number( card.tariff );
		});
		
		this.setScore( total );
	},
	setScore: function( value ) {
		this.score = value;
		this.setScoreField();
	},
	setScoreField: function() {
		document.getElementById( this.score_id ).innerHTML = this.getScore();
	},
	getScore: function() {
		return this.score;
	},
	clearCards: function() { // remove all cards from displaying - doesn't actually delete any data
	    document.querySelector( this.list ).innerHTML = null;
	},
	setClickHandler: function() { // click handlers for each card
	    var _this = this;
	    [].forEach.call(document.querySelectorAll( this.card ), function (el) {
            el.addEventListener('click', _this.clickHandler, false);
        });
	},
	clickHandler: function() {
	    var id = $(this).data('propertyid');
	    if( id ) // display the card
	    {
	        var property = deck.cards[ deck.findProperty( id ) ];
	        deck_tooltip.show( property, false, true ); // the card is not new, but it is in our deck
	    }
	},
	findProperty: function( id ) { // find a card in the deck by it's ID
	    for (var i = 0; i < this.cards.length; i++) {
	        if( this.cards[ i ].id == id )
            {
                return i;
            }
	    }
	},
	removeProperty: function( id ) { // remove a card from the deck by it's ID
	    var index = this.findProperty( id );
        if ( index > -1 ) {
            this.cards.splice( index, 1 );
        }
        this.rebuild();
	},
	show: function() {
	    this.rebuild();
	    document.querySelector( this.obj ).style.display = 'block';
	},
	hide: function() {
	    document.querySelector( this.obj ).style.display = 'none';
	}
};

window.first_property_display =
{
	show: function()
	{
		console.log("first_property_display.show()");
		document.querySelector('.first-property .property-title').innerHTML = window.deck.cards[0].name;
		document.querySelector('.first-property').style.display = 'block';
		window.deck_tooltip.setCard(window.deck.cards[0]);
		window.deck_tooltip.setObj("#first-property-card");
		window.deck_tooltip.show();
	},
	hide: function()
	{
		document.querySelector( '.first-property' ).style.display = 'none';
		window.deck_tooltip.resetObj();
        populateMap();
		window.deck.setBattleCard(window.deck.cards[0]);
	    window.deck.rebuild();
	}
};
