

var J = {};
J.LoanCalc = {};


/*
 * J.LoanCalc.App
 */

J.LoanCalc.App = function()	{
	
	this.loanArray = new Array();
	this.loanCount = 0; //this.loanArray.length;
	this.uidIterator = 0;
	this.paymentType = 'avalanche';
	this.totalPayment = 0;
	this.totalMinPayment = 0;
	

	this.findLoanIndex = function(uid)	{
		var loanIndex = -1;
		for(i=0;i<this.loanCount;i++)   {
                        if(this.loanArray[i].uid==uid)
                                loanIndex = i;
                }
		return loanIndex;
	}
	/*
	 *	createLoan()
	 *	Creates a new J.LoanCalc.Loan object, pushes it to the loanArray in
	 *	the J.LoanCalc.App singleton and calls J.LoanCalc.Loan.create to
	 *	create the DOM elements.
	 */
	this.createLoan = function()	{
		console.log('J.LoanCalc.App.createLoan() called');
		this.loanArray.push(new J.LoanCalc.Loan(this.uidIterator));
		this.loanCount++;
		this.uidIterator++;
		console.log(this.loanArray);
	};

	/*
	 *	destroyLoan(uid)
	 *	Removes the loan of specified uid from the J.LoanCalc.App singleton
	 *	loanArray and calls J.LoanCalc.Loan.destroy to remove DOM elements.
	 */
	this.destroyLoan = function(uid)	{
		console.log("Destroying Loan "+uid);
		var loanIndex = this.findLoanIndex(uid);
		this.loanArray[loanIndex].destroy(uid);

		console.log(this.loanArray);
		this.loanArray.splice(loanIndex,1);
		this.loanCount--;

 		console.log(this.loanArray);

	};

	this.updateLoan = function(uid, field, value)	{
		var loanIndex = this.findLoanIndex(uid);
		switch(field)	{
			case 'name':
				this.loanArray[loanIndex].setName(value);
				break;
			case 'balance':
				this.loanArray[loanIndex].setBalance(value);
				break;
			case 'minPayment':
				this.loanArray[loanIndex].setMinPayment(value);
				console.log('getreadyyy');
				this.updateTotalMinPayment();
				break;
			case 'interest':
				this.loanArray[loanIndex].setInterest(value);
				break;
		}
	};
	
	this.updateTotalMinPayment = function()	{
		var totalMin = 0;
		for(i=0;i<this.loanCount;i++)	{
			totalMin += this.loanArray[i].getMinPayment();
			console.log('totalMin: '+totalMin);
		}
		this.totalMinPayment = totalMin;
		if(this.totalMinPayment > this.totalPayment)	{
			this.totalPayment = this.totalMinPayment;
			$('#totalMonthlyPayment').val(this.totalPayment);			
		}
		console.log('TotalMinPayment: '+this.totalMinPayment);
	};
	
	this.updatePayment = function(value)	{
		this.totalPayment = value;
		//Check to see if the new payment is lower than the minimum.. if so, increase.
		this.updateTotalMinPayment(); 
	};

	this.getInfo = function(uid, field)	{
		var loanIndex = this.findLoanIndex(uid);
		switch(field)	{
			case 'name':
				return this.loanArray[loanIndex].getName();
				break;
			case 'balance':
				return this.loanArray[loanIndex].getBalance();
				break;
			case 'minPayment':
				return this.loanArray[loanIndex].getMinPayment();
				break;
			case 'interest':
				return this.loanArray[loanIndex].getInterest();
				break;
		}		
	}

	this.calculate = function()	{
		console.log('Calculating...');
		var monthlyPayment = $('#totalMonthlyPayment').val();
		var indexSortArray = this.sortLoans();
		this.calcAndPrintLoan(indexSortArray);
	}
	
	
	this.calcAndPrintLoan	=	function(indexSortArray)	{
		var extraPayment = this.totalPayment - this.totalMinPayment,
			rollover = 0,
			rolloverMonth = new J.LoanCalc.Date();

		
		//Loan Loop
		for(l=0;l<this.loanCount;l++)	{
			//Constant loan Info
			var loanName = this.getInfo(indexSortArray[l], 'name'),
				curBalance = this.getInfo(indexSortArray[l], 'balance'),
			    interest = this.getInfo(indexSortArray[l], 'interest')*.01,
			    minPayment = this.getInfo(indexSortArray[l], 'minPayment');
			var monthlyResults = '<div class=\'monthlyResults\'>\n';
			monthlyResults += '<table><tr>';
			monthlyResults += '<td class=\'tHead\'>Month</td>\n';
			monthlyResults += '<td class=\'tHead\'>Principle</td>\n';
			monthlyResults += '<td class=\'tHead\'>Total Interest</td>\n';
			monthlyResults += '<td class=\'tHead\'>Monthly Payment</td>\n';
			monthlyResults += '<td class=\'tHead\'>princPaid</td>\n';
			monthlyResults += '<td class=\'tHead\'>interestPaid</td>\n';
			monthlyResults += '</tr>\n';		


			//Payment Initialization
			var princRemaining = curBalance,
				currentMonth = new J.LoanCalc.Date(),
				payment = 0,
				totalInterestPaid = 0;
			currentMonth.setCurrent();
			
			//Print loop
			while(princRemaining > 0)	{
				console.log(this.getInfo(indexSortArray[l],'name')+': '+currentMonth.print());
				//Interest calculations
				var interestPaid = (princRemaining * (interest/12)),
					princPaid = 0;
				totalInterestPaid += interestPaid;
				

				//Set monthly payments
				if(currentMonth.getFloat() < rolloverMonth.getFloat())	{
					payment = minPayment;
				}
				else if(currentMonth.getFloat() == rolloverMonth.getFloat())	{
					payment = minPayment + rollover; 
					rollover = 0;
				}
				else
					payment = minPayment + extraPayment;

				//Pay principle
				if(payment-interestPaid < princRemaining)	{
					princPaid = payment - interestPaid;
					princRemaining -= princPaid;
				}
				else	{
					princPaid = princRemaining;
					rollover = payment - (princRemaining - interestPaid);
					payment = princRemaining + interestPaid;
					princRemaining = 0;
					rolloverMonth.setDate(currentMonth.getYear(),currentMonth.getMonth());
					extraPayment += minPayment;
				}
				var alternateRows = currentMonth.getMonth() % 2;
				monthlyResults += '<tr class=\'alternateRows'+alternateRows+'\'><td>'+currentMonth.print()+'</td><td>$'+princRemaining.toFixed(2)+'</td><td>$'+totalInterestPaid.toFixed(2)+'</td><td>$'+payment.toFixed(2)+'</td><td>$'+princPaid.toFixed(2)+'</td><td>$'+interestPaid.toFixed(2)+'</td></tr>';
								


				currentMonth.increment();

			}//print loop
			monthlyResults += '</table></div>';
			
			var html = '<div class=\'resultBar\'>\n';
			html += '	<a href=\'#\' class=\'inspectResultLink\' ><div class=\'inspectResult\'></div></a>\n';
			html += '	<div class=\'loanName\'>'+loanName+'</div>\n';
			html += '	<div class=\'payoffDate\'>Payoff: '+currentMonth.print()+'</div>\n';
			html += '	<div class=\'totalInterest\'>'+totalInterestPaid.toFixed(2)+'</div>\n';
			html += '		</div>\n';
			html += monthlyResults;
		
			$('#resultsContainer').append(html);		
		}//loanloop

	}

	this.sortLoans = function()	{
		//Sloppy O(n^2) sort, needs improvement
		var sortedArray = new Array();
		var sortField = '';
		if(this.paymentType=='avalanche')
			sortField = 'interest';
		else
			sortField = 'balance';
		
		while(sortedArray.length < this.loanCount)	{
			var maxValue = 0;
			var currentMaxUID = 0;

			for(s=0;s<this.loanCount;s++)		{
				var loanID = this.loanArray[s].uid;

				if(sortedArray.indexOf(loanID) == -1 &&	this.getInfo(loanID,sortField) > maxValue)	{
					currentMaxUID = loanID;
					maxValue = this.getInfo(loanID,sortField);
				}
			}
			sortedArray.push(currentMaxUID);
		}
		console.log('SORTEDARRAY: '+sortedArray);
		if(this.paymentType=='avalanche')
			return sortedArray;
		else
			return sortedArray.reverse();
			
	}
};

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
	
	increment : function()	{
		if(this.month==11)	{
			this.year++; //Happy new year!
			this.month = 0;
		}
		else
			this.month++; //New month
	},
	
	print : function()	{
		var months = new Array(12);
		months[0]  = "January";
		months[1]  = "February";
		months[2]  = "March";
		months[3]  = "April";
		months[4]  = "May";
		months[5]  = "June";
		months[6]  = "July";
		months[7]  = "August";
		months[8]  = "September";
		months[9]  = "October";
		months[10] = "November";
		months[11] = "December";
	
		return months[this.month] + " " + this.year;
		
	}

};


/*
 * J.LoanCalc.Loan
 */

J.LoanCalc.Loan	= function(uid)	{
	this.uid = uid;
	this.name;
	this.balance = 0;
	this.minPayment = 0;
	this.interest = 0;
	this.create(this.uid);
	
};

J.LoanCalc.Loan.prototype = {

	/*
	 *	create(uid)
	 *	Creates the DOM elements of the new loan
	 */
	create : function(uid)	{
		console.log('J.LoanCalc.Loan.create('+uid+') called');
		var html = '<div id=\'loanBarInput'+uid+'\' class=\'loanBarInput\'>\n';
		html += '	<a href=\'#\' class=\'destroyLoan\' id=\'delete'+uid+'\'><div class=\'destroyLoanX\'></div></a>\n';
		html += '	<div class=\'loanName\'>\n';
		html += '	                <div class=\'fieldTitle\'>Loan Name</div>\n'
		html += '	                <div class=\'fieldInput\'><input id=\'loanNameInput'+uid+'\' class=\'loanNameInput\' /></div>\n';
		html += '	        </div>\n';
	        html += '	<div class=\'currentBalance\'>\n';
		html += '	                <div class=\'fieldTitle\'>Current Balance</div>\n';
		html += '	                <div class=\'fieldInput\'>$<input id=\'loanBalanceInput'+uid+'\' class=\'loanBalanceInput\' /></div>\n';
		html += '	        </div>\n';
		html += '	        <div class=\'minMonthlyPayment\'>\n';
		html += '	                <div class=\'fieldTitle\'>Min. Payment</div>\n';
		html += '	                <div class=\'fieldInput\'>$<input id=\'loanPaymentInput'+uid+'\' class=\'loanPaymentInput\' /></div>\n';
		html += '	        </div>\n';
		html += '	        <div class=\'interest\'>\n';
		html += '	                <div class=\'fieldTitle\'>Interest</div>\n';
		html += '	                <div class=\'fieldInput\'>%<input id=\'loanInterestInput'+uid+'\' class=\'loanInterestInput\' /></div>\n';
		html += '        </div>\n';
		html += '		</div>\n';
		
		$('#loanBarInputContainer').append(html);
		$('#loanBarInput'+uid).css('display','none').slideDown('500');
	},

	/*
	 *	destroy(uid)
	 *	Removes the DOM elements of a specific loan
	 */
	destroy : function(uid)	{
		$('#loanBarInput'+uid).slideUp(500, function(){
			$('#loanBarInput'+uid).remove();
		});
	},

	setName : function(name)	{
		this.name = name;
	},
	
	setBalance : function(balance)	{
		this.balance = balance;
	},
	
	setMinPayment : function(minPayment)	{
		this.minPayment = minPayment;
	},

	setInterest : function(interest)	{
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
	}

};



$(function()	{

	var loanApp = new J.LoanCalc.App();
	//Make first loan available
	loanApp.createLoan();

	$(".paymentTypeButtonLink").click(function ()	{
		if($(this).is('.avaLink'))	{
			$('#avalanche').removeClass('unselectedPaymentType').addClass('selectedPaymentType');
			$('#snowfall').removeClass('selectedPaymentType').addClass('unselectedPaymentType');
		loanApp.paymentType = 'avalanche';
		}
		else	{
			$('#snowfall').removeClass('unselectedPaymentType').addClass('selectedPaymentType');
                        $('#avalanche').removeClass('selectedPaymentType').addClass('unselectedPaymentType');
		loanApp.paymentType = 'snowfall';
		}		
		
	});


	$('.createLoan').live('click', function ()	{
		loanApp.createLoan();
	});
	
	$('.destroyLoan').live('click', function ()	{
		console.log('jquery destroyloan Called');
		var deleteID = $(this).attr('id').substr(6);
		loanApp.destroyLoan(deleteID);
	});		

	$('input').live('change', function()	{
		var uid;
		var field;
		var value = $(this).val();
		
		if($(this).is('.loanNameInput'))	{
			uid = $(this).attr('id').substr(13);
			field = 'name';
			console.log('setting: '+uid+'name');
		}
		else if($(this).is('.loanBalanceInput'))	{
			uid = $(this).attr('id').substr(16);
			field = 'balance';
			console.log('setting: '+uid+'balance');
		}
		else if($(this).is('.loanPaymentInput'))	{
			uid = $(this).attr('id').substr(16);
			field = 'minPayment';
			console.log('setting: '+uid+'minpayment');
		}
		else if($(this).is('.loanInterestInput'))	{
			uid = $(this).attr('id').substr(17);
			field = 'interest';
			console.log('setting: '+uid+'interest');
		}
		else	{ //#totalMonthlyPayment
			field = 'totalMonthlyPayment';
		}

		if(validate(value) && field!='name')	{
			$(this).removeClass('invalidField');
			value = parseFloat(stripCommas(value)).toFixed(2);
			value = parseFloat(value);
			if(field!='totalMonthlyPayment')
				loanApp.updateLoan(uid,field,value);
			else
				loanApp.updatePayment(value);
		}
		else if(!$(this).hasClass('invalidField') && field!='name')
			$(this).addClass('invalidField');
		if(field=='name')
			loanApp.updateLoan(uid,field,value);
	});



	$('.calculate').click(function ()	{
		loanApp.calculate();
	});

	/*
	 *	validate(s)
	 */

	var validate = function(s)	{
		var validChars = "0123456789.,";
		var numberTest = true;
		var decimalCount = 0;
		var char;
		for(i=0;i<s.length && numberTest==true;i++)	{
			char = s.charAt(i);
			if(char=='.')
				decimalCount++;
			if(validChars.indexOf(char) == -1)
				numberTest = false;
		}
		if(decimalCount>=2)
			numberTest = false;
		return numberTest;
	};

	var stripCommas = function(s)	{
		while(s.indexOf(',') != -1)
			s = s.replace(',','');
		return s;
	};


});

//IE Array.indexOf fix
if(!Array.indexOf){
  Array.prototype.indexOf = function(obj){
   for(var i=0; i<this.length; i++){
    if(this[i]==obj){
     return i;
    }
   }
   return -1;
  }
}
