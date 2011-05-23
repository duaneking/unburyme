/*
 * J.LoanCalc.Graph
 */

J.LoanCalc.Graph = function(loanApp)	{
	
	this.loanApp = loanApp;
	this.loanDataSet = [];
	this.loanData = [];
	this.loanNames = [];
	this.dateSet = [];	
	this.colorSet = this.loanApp.config.colorSet;
	this.lastFieldGraphed = 'princRemaining';

	this.draw = function(field)	{
		if(!field)
			field = this.lastFieldGraphed;
		// Ensure graph div is showing
		$('#graph').fadeIn(this.loanApp.config.fadeSpeed);
		$('#graphViewOptions').fadeIn(this.loanApp.config.fadeSpeed);

		this.drawTitle(field);
		this.getGraphData(field);
		this.makeDataSet();
		this.makeXAxis();
		this.lastFieldGraphed = field;
		$.plot($('#graph'), this.loanDataSet, {
			colors: this.colorSet,
			xaxis: {
				ticks: this.dateSet
			},
			yaxis: {
				tickFormatter: this.dollarFormatter
			},
			grid:	{
				backgroundColor: { colors: ['#ffffff','#b0edf7'] }
			}
		});
	};
	
	this.drawTitle = function(field)	{
		$('#graphTitle').fadeIn(this.loanApp.config.fadeSpeed);
		var title;
		switch(field)	{
			case 'princRemaining':
				title = 'Principle Remaining';
				break;
			case 'princPaid':
				title = 'Principle Paid';
				break;
			case 'totalInterestPaid':
				title = 'Total Interest Paid';
				break;
			case 'monthlyPayment':
				title = 'Monthly Payment'
				break;
		}
		$('#graphTitle').html(title);
	};

	this.makeDataSet = function()	{
	
		for(var i=0;i<this.loanApp.loanCount;i++)	{
			var dataDict = [];
			dataDict['label'] = this.loanNames[i];
			dataDict['data'] = this.loanData[i];
			this.loanDataSet.push(dataDict);
		}

	};

	this.makeXAxis = function()	{
		var date = new J.LoanCalc.Date();
		date.setCurrent();
		var month = date.getMonth();
		var year = date.getYear()+1;
        var monthMod = 1;
        var yearMod = 1;

		var untilNewYear = (12 - month)%12;
		
		//Find which data set is the largest
		var maxData = 0;
		for(var i=0;i<this.loanApp.initLoanCount();i++)	{
			if(this.loanData[i].length > maxData)
				maxData = this.loanData[i].length;
		}

        // Convert entry point count to years        
        var yearsToPay = Math.ceil(maxData / 12);

        if(yearsToPay > 8) {
            monthMod = Math.ceil(yearsToPay/8);
            yearMod = Math.ceil(yearsToPay/8);
        }
            

		//Make x-axis ticks
		for(var i=0;i<yearsToPay;i++)	{
			var dataDict = [];
			dataDict.push(untilNewYear);
			dataDict.push(year+(i*yearMod));
			this.dateSet.push(dataDict);
			untilNewYear += (12 * monthMod);
		}
	};

	this.getGraphData = function(field)	{
		this.clearGraphData();
		for(var i=0;i<this.loanApp.initLoanCount();i++)	{
			this.loanData.push(this.loanApp.initLoanArray[i].results.getGraphData(field));
			this.loanNames.push(this.loanApp.initLoanArray[i].getName());
		}
	};

	this.clearGraphData = function()	{
		this.loanDataSet = [];
		this.loanNames = [];
		this.loanData = [];
		this.dateSet = [];
	};

	this.dollarFormatter = function(v, axis)	{
		return "$"+v;
	};

	this.reset = function()	{
		$('#graph').fadeOut(this.loanApp.config.fadeSpeed);
		$('#graphViewOptions').fadeOut(this.loanApp.config.fadeSpeed);
		$('#graphTitle').fadeOut(this.loanApp.config.fadeSpeed);
		this.clearGraphData();
		this.lastFieldGraphed = 'princRemaining';
	};


};
