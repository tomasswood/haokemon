
window.game_state = {
	days:
	{
	    days: 0,
    	get: function() { return this.days },
    	set: function(value) { this.days = value },
    	add: function(value) { this.days += value },
	},
	location: {
        lat: undefined,
        lng: undefined
	},
	deck: window.deck,
	
};

