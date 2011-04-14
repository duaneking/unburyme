
/*
 * J.LoanCalc.Loan
 */

J.LoanCalc.Loan	= function(uid, loanApp)	{
	this.uid = uid;
	this.loanApp = loanApp;
	this.name = 'Loan '+(this.uid+1);
	this.balance = 0;
	this.minPayment = 0;
	this.interest = 0;
	this.results = new J.LoanCalc.ResultBar(this.uid, this, this.loanApp);
	this.create();
	this.initialized = 0;
	this.deleted = 0;
	this.initBalance = 0;
	this.initMinPayment = 0;
	this.initInterest = 0;
};

J.LoanCalc.Loan.prototype = {

	/*
	 *	create(uid)
	 *	Creates the DOM elements of the new loan
	 */
	create : function()	{
		J.LoanCalc.debug('J.LoanCalc.Loan.create('+this.uid+') called');
		var html = '<div id=\'loanBarInput'+this.uid+'\' class=\'loanBarInput uninitialized\'>\n';
		html += '	<a href=\'#\' class=\'destroyLoan\' id=\'delete'+this.uid+'\'><div class=\'destroyLoanX\'></div></a>\n';
		html += '	<div class=\'loanName\'>\n';
		html += '	                <div class=\'fieldTitle\'>Loan Name</div>\n'
		html += '	                <div class=\'fieldInput\'><input id=\'loanNameInput'+this.uid+'\' class=\'loanNameInput\' /></div>\n';
		html += '	        </div>\n';
	        html += '	<div class=\'currentBalance\'>\n';
		html += '	                <div class=\'fieldTitle\'>Current Balance</div>\n';
		html += '	                <div class=\'fieldInput\'>$<input id=\'loanBalanceInput'+this.uid+'\' class=\'loanBalanceInput  uninitialized\' /></div>\n';
		html += '	        </div>\n';
		html += '	        <div class=\'minMonthlyPayment\'>\n';
		html += '	                <div class=\'fieldTitle\'>Min. Payment</div>\n';
		html += '	                <div class=\'fieldInput\'>$<input id=\'loanPaymentInput'+this.uid+'\' class=\'loanPaymentInput  uninitialized\' /></div>\n';
		html += '	        </div>\n';
		html += '	        <div class=\'interest\'>\n';
		html += '	                <div class=\'fieldTitle\'>Interest</div>\n';
		html += '	                <div class=\'fieldInput\'>%<input id=\'loanInterestInput'+this.uid+'\' class=\'loanInterestInput  uninitialized\' /></div>\n';
		html += '        </div>\n';
		html += '		</div>\n';
		
		$('#loanBarInputContainer').append(html);
		$('#loanBarInput'+this.uid).css('display','none').slideDown(this.loanApp.config.slideSpeed);
	},

	/*
	 *	destroy(uid)
	 *	Removes the DOM elements of a specific loan
	 */
	destroy : function()	{
		J.LoanCalc.debug('Destroying loan: '+this.uid);
		$('#loanBarInput'+this.uid).slideUp(this.loanApp.config.slideSpeed, function(){
			$('#loanBarInput'+this.uid).remove();
		});
		this.results.destroy();
		//Remove all uninitialization tags
		this.cleanField('loanBarInput');
		this.cleanField('loanNameInput');
		this.cleanField('loanBalanceInput');
		this.cleanField('loanPaymentInput');
		this.cleanField('loanInterestInput');
		this.initialized = 0;
		this.deleted = 1;
		this.initName = 0;
		this.initBalance = 0;
		this.initMinPayment = 0;
		this.initInterest = 0;
	},

	setName : function(name)	{
		this.name = name;
	},
	
	setBalance : function(balance)	{

		this.initializeField('loanBalanceInput');
		this.balance = balance;
	},
	
	setMinPayment : function(minPayment)	{

		this.initializeField('loanPaymentInput');
		this.minPayment = minPayment;
	},

	setInterest : function(interest)	{

		this.initializeField('loanInterestInput');
		this.interest = interest;
	},

	getName : function()	{
		return this.name;
	},

	getBalance : function()	{
		return this.balance;
	},

	getMinPayment : function()	{
		return this.minPayment;
	},

	getInterest : function()		{
		return this.interest;
	},

	getUID : function()	{
		return this.uid;
	},

	calculate : function()	{
		this.results.calculate();
	},

	cleanField : function(field)	{
		$('#'+field+this.uid).removeClass('uninitialized');
		$('#'+field+this.uid).removeClass('invalidField');
	},


	initializeField : function(field)	{

		switch(field){
			case 'loanBalanceInput':
				this.initBalance = 1;
				break;
			case 'loanPaymentInput':
				this.initMinPayment = 1;
				break;
			case 'loanInterestInput':
				this.initInterest = 1;
				break;
		}
		
		this.cleanField(field);

		if(this.initBalance && this.initMinPayment && this.initInterest)	{
			this.initialized = 1;
			this.cleanField('loanBarInput');
		}

		
	}

};
