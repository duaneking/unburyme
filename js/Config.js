/*
 * J.LoanCalc.Config
 */

J.LoanCalc.Config = function()	{
    
	this.slideSpeed = 500;
	this.sliderWaitToCalculate = 50;
	this.sliderMax = 5000;
	this.fadeSpeed = 200;
	this.colorSet = ['#01dcff', '#85f9a1', '#e7f985', '#ff9ed7', '#9ec3ff'];
    $.fx.off = false;
};

J.LoanCalc.debug = function(s)	{
    if(typeof console == 'object')
    	console.log(s);
};
