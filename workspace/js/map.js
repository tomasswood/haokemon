function initMap()
{
    var layer = "watercolor";
    var mapOptions = {
        center: new google.maps.LatLng(30.2703436, -97.7574737),
        zoom: 16,
        streetViewControl: false,
        draggable: false,
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        disableDefaultUI: true,
        // mapTypeId: layer,
    }
    
    // Create map, attach options
    window.map = new google.maps.Map(window.document.getElementById("map_div"), mapOptions);
    window.geocoder = new google.maps.Geocoder;
    // window.map.mapTypes.set(layer, new google.maps.StamenMapType(layer));
    // window.map.overlayMapTypes.insertAt(0, new google.maps.StamenMapType("toner-labels"));

    // Create the search box and link it to the UI element.
  	var inputContainer = document.getElementById( 'pac-input-container' );
  	var input = document.getElementById( 'pac-input' );
  	searchBox = new google.maps.places.SearchBox( input );
  	var searchInput = document.getElementById( 'search-input' );
  	mainSearchBox = new google.maps.places.SearchBox( searchInput );
  	map.controls[ google.maps.ControlPosition.TOP_LEFT ].push( searchInput );

  	// Bias the SearchBox results towards current map's viewport.
  	map.addListener( 'bounds_changed', function() 
  	{
  	    var bounds = map.getBounds();
    	searchBox.setBounds( bounds );
    	mainSearchBox.setBounds( bounds );
  	});
  	
    var officeLatLng = { lat: -32.925619, lng: 151.767931 };
    var officeMarker = new google.maps.Marker({
        position: officeLatLng,
        map: map,
        title: 'This game is brought to you by the wonderful YesBookit developers here! Tom did most of the work.'
    });

  	// Listen for the event fired when the user selects a prediction and retrieve
  	// more details for that place.
  	searchBox.addListener( 'places_changed', function()
  	{
    	var places = searchBox.getPlaces();
    	
        if ( places.length == 0 ) {
      		return;
    	}

	    // For each place, get the icon, name and location.
	    var bounds = new google.maps.LatLngBounds();
	    places.forEach( function( place )
	    {
	    	var icon = {
	        	url: place.icon,
	        	size: new google.maps.Size( 71, 71 ),
	        	origin: new google.maps.Point( 0, 0 ),
	        	anchor: new google.maps.Point( 17, 34 ),
	        	scaledSize: new google.maps.Size( 25, 25 )
	      	};

	      	if ( place.geometry.viewport ) {
	        	// Only geocodes have viewport.
	        	bounds.union( place.geometry.viewport );
	      	} else {
	        	bounds.extend( place.geometry.location );
	      	}
	    });
	    
	    map.fitBounds( bounds );

        var cords = map.getCenter();
        var pos = {
            lat: cords.lat(),
            lng: cords.lng()
        };
  	    locationFound();
    });
     
    mainSearchBox.addListener( 'places_changed', function()
  	{
    	var places = mainSearchBox.getPlaces();
    	
        if ( places.length == 0 ) {
      		return;
    	}

	    // For each place, get the icon, name and location.
	    var bounds = new google.maps.LatLngBounds();
	    places.forEach( function( place )
	    {
	    	var icon = {
	        	url: place.icon,
	        	size: new google.maps.Size( 71, 71 ),
	        	origin: new google.maps.Point( 0, 0 ),
	        	anchor: new google.maps.Point( 17, 34 ),
	        	scaledSize: new google.maps.Size( 25, 25 )
	      	};

	      	if ( place.geometry.viewport ) {
	        	// Only geocodes have viewport.
	        	bounds.union( place.geometry.viewport );
	      	} else {
	        	bounds.extend( place.geometry.location );
	      	}
	    });
	    
	    map.fitBounds( bounds );
    });
     
    $('#start').click(function() {
        addSpinner( $(this) );
        beginGame();
    }); 
    
    $('#load').click(function() {
        addSpinner( $(this) );
        
        var pos = JSON.parse( localStorage.getItem("ybi.holiday_bash.location" ) );
        map.setCenter( pos );
        
        var cards = JSON.parse( localStorage.getItem("ybi.holiday_bash.cards") );
        deck.addCards( cards );
        
        load_data( false );
        
        $('.overlay').hide();
        $('#start-game').hide();
        
        deck.init();
    });
    
    $('#find').click(function() {
        addSpinner( $(this) );
        // HTML5 geolocation.
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            map.setCenter(pos);
            
            geocoder.geocode({'location': pos}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        $('#pac-input').val(results[1].formatted_address);
                    }
                }
            });
            
            locationFound();
        }, function() {
            alert('Unable to find your location.');
	  	});
    });
    
    $('#continue').click(function() {
        addSpinner( $( this ) );
        
        load_data( true );
    });
    
    function load_data( new_game ) {
        
        $.getJSON("json/location_index.json", function( locations ) {
            
            if( locations )
            {
                var pos = {
                    lat: map.getCenter().lat(),
                    lng: map.getCenter().lng()
                };
                localStorage.setItem( "ybi.holiday_bash.location", JSON.stringify( pos ) );
                var location;
                geocoder.geocode({'location': pos}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            location = results[1].address_components[0].short_name;
                
                            window.location_index = locations[ location ];
                            
                            if( window.location_index )
                            {
                                var price_index = "0-100";
                                $.getJSON("json/price_index.json", function( prices ) {
                                    
                                    if( prices )
                                    {
                                        window.prices_index = prices[ price_index ];
                                        
                                        if( window.prices_index )
                                        {
                                            $.getJSON("json/properties.json", function( properties ) {
                                                
                                                if( properties )
                                                {
                                                    var props = [];
                                                    for ( var key in properties ) {
                                                        if ( properties.hasOwnProperty( key ) ) {
                                                            if( window.location_index.indexOf( key ) > -1 && window.prices_index.indexOf( key ) > -1 )
                                                            {
                                                                props.push( properties[ key ] ); 
                                                            }
                                                        }
                                                    }
                                                    window.properties = props;
                                                    
                                                    if( window.properties )
                                                    {
                                                        if(new_game)
                                                        {
                                                            console.log('data loaded. initialising deck and showing first property');
                                                            window.deck.init();
                                                            window.first_property_display.show();
                                                        }
                                                        else
                                                        {
                                                            populateMap();
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                        // $('#search-input').show();
                        $('#pac-input-container').hide();
                    }
                });
            }
        });
    }
    
    function addSpinner( $this ) {
        $this.html( '<i class="fa fa-spinner fa-pulse"></i>' );
    }
    
    function beginGame( got_location ) {
        $('.overlay').hide();
        $('#start-game').hide();
        $('#pac-input-container').show();
        
        localStorage.removeItem('ybi.holiday_bash.location');
        localStorage.removeItem('ybi.holiday_bash.cards');
    }
    
    function locationFound() {
        $('#find').hide();
        $('#continue').show();
    }
}

function populateMap() {
    if( window.markers.length == 0 )
    {
        var bounds = new google.maps.LatLngBounds();
        for ( var i = 0; i < window.properties.length; i++ ) {
            var property    = window.properties[i];
            if( deck.findProperty( property.id ) >= 0 ) // check if a property is already in the deck
            {
                continue;
            }
            
            var card_html   = cardMarkersContent( false );
            var pos         = new google.maps.LatLng( property.lattitude, property.longitude )
            bounds.extend( pos );
            var curMarker   = new RichMarker({
                position: pos,
                map: map,
                flat: true,
                anchor: RichMarkerPosition.MIDDLE,
                content: card_html,
                property: property
            });
            curMarker.addListener('click', function() {
                console.log('Map marker clicked');
                deck_tooltip.show( this.property );
                var index = window.markers.indexOf( this );
                if ( index > -1 ) {
                    window.markers.splice( index, 1 );
                }
                this.setMap(null);
            });
            window.markers.push( curMarker );
        }
        map.fitBounds( bounds );
    }
}

function cardMarkersContent( active ) {
    var flip = ( active ) ? 'make-flip' : '';
    var html = '<div class="flip-container ' + flip + '"> \
    	<div class="flipper"> \
    		<div class="front"> \
    			<img src="img/home_away_birdhouse.png"> \
    		</div> \
    		<div class="back"> \
    		</div> \
    	</div> \
    </div>';
    
    return html;
}

function generateArena( player_card, npc_card ) {
    var $arena  = $('#arena');
    var image   = window.images[Math.floor(Math.random() * window.images.length)];
    $arena.css("background-image", "url(img/location/" + image + ".jpg)");
    
    deck_tooltip.setObj( '#player-card' );
    deck_tooltip.show( player_card, false, true ); // the card is not new, but it is in our deck
    
    deck_tooltip.setObj( '#cpu-card' );
    deck_tooltip.show( npc_card, false, true ); // the card is not new, but it is in our deck
    
    $arena.show();
}

function clearArena() {
    $('#arena').hide();
    
    $('#player-health-remaining').width( '100%' );
    $('#player-health-remaining').removeClass( "bad neutral good perfect" ).addClass( 'perfect' );
    $('#cpu-health-remaining').width( '100%' );
    $('#cpu-health-remaining').removeClass( "bad neutral good perfect" ).addClass( 'perfect' );
}