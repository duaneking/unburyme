
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
	this.isInitialized = {
		'loan' : 0,
		'name' : 0,
		'balance' : 0,
		'minPayment' : 0,
		'interest' : 0
	}
	this.isValid = {
		'loan' : 0,
		'name' : 0,
		'balance' : 0,
		'minPayment' : 0,
		'interest' : 0
	}
	this.deleted = 0;
};

J.LoanCalc.Loan.prototype = {

	/*
	 *	create(uid)
	 *	Creates the DOM elements of the new loan
	 */
	create : function()	{
		J.LoanCalc.debug('J.LoanCalc.Loan.create('+this.uid+') called');
		var html = '<div id=\'loanbar'+this.uid+'\' class=\'loanBarInput uninitialized\'>\n';
		html += '	<a href=\'#\' class=\'destroyLoan\' id=\'delete'+this.uid+'\'><div class=\'destroyLoanX\'></div></a>\n';
		html += '	<div class=\'loanName\'>\n';
		html += '	                <div class=\'fieldTitle\'>Loan Name</div>\n'
		html += '	                <div class=\'fieldInput\'><input id=\'loanname'+this.uid+'\' class=\'name\' /></div>\n';
		html += '	        </div>\n';
	        html += '	<div class=\'currentBalance\'>\n';
		html += '	                <div class=\'fieldTitle\'>Current Balance</div>\n';
		html += '	                <div class=\'fieldInput\'>$<input id=\'loanbalance'+this.uid+'\' class=\'balance  uninitialized\' /></div>\n';
		html += '	        </div>\n';
		html += '	        <div class=\'minMonthlyPayment\'>\n';
		html += '	                <div class=\'fieldTitle\'>Min. Payment</div>\n';
		html += '	                <div class=\'fieldInput\'>$<input id=\'loanminPayment'+this.uid+'\' class=\'minPayment  uninitialized\' /></div>\n';
		html += '	        </div>\n';
		html += '	        <div class=\'interest\'>\n';
		html += '	                <div class=\'fieldTitle\'>Interest</div>\n';
		html += '	                <div class=\'fieldInput\'>%<input id=\'loaninterest'+this.uid+'\' class=\'interest  uninitialized\' /></div>\n';
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
		$('#loanbar'+this.uid).slideUp(this.loanApp.config.slideSpeed, function(){
			$('#loanbar'+this.uid).remove();
		});
		this.results.destroy();
		//Remove all uninitialization tags
		this.cleanField('bar');
		this.cleanField('name');
		this.cleanField('balance');
		this.cleanField('minPayment');
		this.cleanField('interest');
    
        // Should be removed from array; sanity check
		this.deleted = 1;

		for(var i=0;i<5;i++)		
			this.isInitialized[i] = 0;
	},

	setName : function(name)	{
		this.name = name;
	},
	
	setBalance : function(balance)	{

		this.initializeField('balance');
		this.balance = balance;
	},
	
	setMinPayment : function(minPayment)	{

		this.initializeField('minPayment');
		this.minPayment = minPayment;
	},

	setInterest : function(interest)	{

		this.initializeField('interest');
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
	
	getValue : function(field)	{
		var value;
		switch(field)	{
			case 'name':
				value = this.getName();
				break;
			case 'balance':
				value = this.getBalance();
				break;
			case 'minPayment':
				value = this.getMinPayment();
				break;
			case 'interest':
				value = this.getInterest();
				break;
		}
		return value;
	},

	getUID : function()	{
		return this.uid;
	},

	calculate : function()	{
		this.results.calculate();
	},

	validate : function(field,value)	{
		var validChars = "0123456789., ",
		validTest = true,
		character;
		for(i=0;i<value.length && validTest==true;i++)	{
			character = value.charAt(i);
			if(validChars.indexOf(character) == -1)
				validTest = false;
		}
		if(value=='')	{
			validTest = false;
			$('input .'+field).val('');
		}

		if(field=='name')
			validTest = true;
		
		if(validTest)
			this.isValid[field] = 1;
		else	
			this.isValid[field] = 0;

		if(this.isValid['balance'] && this.isValid['minPayment'] && this.isValid['interest'])
			this.isValid['loan'] = 1;

        // Call validateDisplay to handle visual representation
        this.validateDisplay(field,validTest);
        J.LoanCalc.debug(field+': '+validTest);
		return validTest;
	},

	
    validateDisplay : function(field,isFieldValid)  {

        if(isFieldValid)
            $('#loan'+field+this.uid).removeClass('invalidField');
        else
            $('#loan'+field+this.uid).addClass('invalidField');
    },


	cleanField : function(field)	{
		if(field=='loan')
			field = 'bar';
		$('#loan'+field+this.uid).removeClass('uninitialized');
		$('#loan'+field+this.uid).removeClass('invalidField');
	},


	initializeField : function(field)	{
		this.isInitialized[field] = 1;
		this.cleanField(field);

		if(this.isInitialized['balance'] && this.isInitialized['minPayment'] && this.isInitialized['interest'])	{
			this.isInitialized['loan'] = 1;
			this.cleanField('loan');
		}

	}

};
