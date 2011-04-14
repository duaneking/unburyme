/*
 * J.LoanCalc.Date
 */

J.LoanCalc.Date = function()	{
	this.year;
	this.month;
	this.create();
};

J.LoanCalc.Date.prototype = {
	
	create : function()	{
		this.year = 0;
		this.month = 0;
		this.setCurrent();
	},
	
	setCurrent : function()	{
		var current = new Date();
		this.year = current.getFullYear();
		this.month = current.getMonth();
	},
	
	setDate : function(year, month)	{
		this.year = year;
		this.month = month;
	},
	
	getMonth : function()	{
		return this.month;
	},
	
	getYear : function()	{
		return this.year;
	},
	
	getFloat : function()	{
		return parseFloat(this.year + (this.month*.01));
	},
	
	getLatest : function(otherDate)	{
		var latestDate = new J.LoanCalc.Date();
		if(this.getYear() > otherDate.getYear())
			latestDate = this;
		else if(this.getYear() < otherDate.getYear())
			latestDate = otherDate;
		else if(this.getMonth() > otherDate.getMonth())
			latestDate = this;
		else if(this.getMonth() < otherDate.getMonth())
			latestDate = otherDate;
		else
			latestDate = this; //They are equal
		return latestDate;
	},

	increment : function()	{
		if(this.month==11)	{
			this.year++; //Happy new year!
			this.month = 0;
		}
		else
			this.month++; //New month
	},
	
	print : function()	{
		var months = [];
		months[0]  = "Jan";
		months[1]  = "Feb";
		months[2]  = "Mar";
		months[3]  = "Apr";
		months[4]  = "May";
		months[5]  = "Jun";
		months[6]  = "Jul";
		months[7]  = "Aug";
		months[8]  = "Sept";
		months[9]  = "Oct";
		months[10] = "Nov";
		months[11] = "Dec";
	
		return months[this.month] + " " + this.year;
		
	}

};
