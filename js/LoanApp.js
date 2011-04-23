

var J = {};
J.LoanCalc = {};


/*
 * J.LoanCalc.LoanApp
 */

J.LoanCalc.LoanApp = function()	{
	
	this.config = new J.LoanCalc.Config();
	this.loanArray = [];
	this.initLoanArray = [];
	this.loanCount = 0; //this.loanArray.length;
	this.uidIterator = 0;
	this.paymentType = 'avalanche';
	this.totalPayment = 0;
	this.totalMinPayment = 0;
	this.autoCalc = 0;

	//Result variables
	this.extraPayment;
	this.rollover;
	this.rolloverMonth = new J.LoanCalc.Date();
	this.graph = new J.LoanCalc.Graph(this);
	this.totalResults = new J.LoanCalc.TotalResults(this);

	this.getLoan = function(uid)	{
		var loanIndex = -1;
		for(var i=0;i<this.loanCount;i++)   {
                        if(this.loanArray[i].uid==uid)
                                loanIndex = i;
                }
		return this.loanArray[loanIndex];
	};
	
	this.getLoanIndex = function(uid)	{
		var loanIndex = -1;
		for(var i=0;i<this.loanCount;i++)   {
                        if(this.loanArray[i].uid==uid)
                                loanIndex = i;
                }
		return loanIndex;
	};
	/*
	 *	createLoan()
	 *	Creates a new J.LoanCalc.Loan object, pushes it to the loanArray in
	 *	the J.LoanCalc.App singleton and calls J.LoanCalc.Loan.create to
	 *	create the DOM elements.
	 */
	this.createLoan = function()	{
		J.LoanCalc.debug('J.LoanCalc.App.createLoan() called');
		this.loanArray.push(new J.LoanCalc.Loan(this.uidIterator, this));
		this.loanCount++;
		this.uidIterator++;
		J.LoanCalc.debug(this.loanArray);
	};

	/*
	 *	destroyLoan(uid)
	 *	Removes the loan of specified uid from the J.LoanCalc.App singleton
	 *	loanArray and calls J.LoanCalc.Loan.destroy to remove DOM elements.
	 */
	this.destroyLoan = function(uid)	{
		J.LoanCalc.debug(this.getLoan(uid));
		J.LoanCalc.debug("Destroying Loan "+uid);
		this.getLoan(uid).destroy()

		J.LoanCalc.debug(this.loanArray);
		this.loanArray.splice(this.getLoanIndex(uid),1);
		this.loanCount--;
		this.refreshInitLoanArray();
		if(this.autoCalc==1 && !this.initLoanCount())	{
			this.clearData();
			this.refreshInitLoanArray();
			$('.calculate').fadeIn(loanApp.config.fadeSpeed);
		}
	};

	this.updateLoan = function(uid, field, value)	{

		switch(field)	{
			case 'name':
				this.getLoan(uid).setName(value);
				break;
			case 'balance':
				this.getLoan(uid).setBalance(value);
				break;
			case 'minPayment':
				this.getLoan(uid).setMinPayment(value);
				this.updateTotalMinPayment();
				break;
			case 'interest':
				this.getLoan(uid).setInterest(value);
				break;
		}
		this.refreshInitLoanArray();
	};
	
	this.updateTotalMinPayment = function()	{
		var totalMin = 0;
		for(var i=0;i<this.loanCount;i++)	{
			totalMin += this.loanArray[i].getMinPayment();
			J.LoanCalc.debug('totalMin: '+totalMin);
		}
		this.totalMinPayment = totalMin;
		if(this.totalMinPayment > this.totalPayment)	{
			this.totalPayment = this.totalMinPayment;
			$('#totalMonthlyPayment').val(this.totalPayment);
			$('#totalMonthlyPayment').removeClass('invalidField');			
		}
		J.LoanCalc.debug('TotalMinPayment: '+this.totalMinPayment);
	};
	
	this.updatePayment = function(value)	{
		this.totalPayment = value;
		//Check to see if the new payment is lower than the minimum.. if so, increase.
		this.updateTotalMinPayment(); 
	};

	this.getInfo = function(uid, field)	{
		
		switch(field)	{
			case 'name':
				return this.getLoan(uid).getName();
				break;
			case 'balance':
				return this.getLoan(uid).getBalance();
				break;
			case 'minPayment':
				return this.getLoan(uid).getMinPayment();
				break;
			case 'interest':
				return this.getLoan(uid).getInterest();
				break;
		}		
	}

	this.calculate = function()	{
		
		J.LoanCalc.debug('Calculating...');
		//Resort and reset
		var monthlyPayment = $('#totalMonthlyPayment').val();
		var sortedLoans = this.sortLoans();
		this.extraPayment = this.totalPayment - this.totalMinPayment;
		this.rollover = 0;
		this.rolloverMonth = new J.LoanCalc.Date();

		this.calcResults(sortedLoans);
		this.graph.draw();
		this.totalResults.calculate();

		this.autoCalc = 1;
	}
	
	
	this.calcResults = function(sortedLoans)	{
		var currentMonth = new J.LoanCalc.Date(),
		    calcName = [],
		    calcBalance = [],
		    calcInterest = [],
		    calcMinPayment = [],
		    calcInterestPaid = [],
		    calcPrincPaid = [],
		    calcMonthlyPayment = [],
		    finishedCalculating = [],
		    remainingLoans = this.initLoanCount();

		//Initialize and draw
		for(var i=0;i<this.initLoanCount();i++)	{
			J.LoanCalc.debug('Initializing: '+sortedLoans[i].uid);

			sortedLoans[i].results.totalInterestPaid = 0;
			sortedLoans[i].results.drawStart();
			calcName[i] = sortedLoans[i].getName();
			calcBalance[i] = sortedLoans[i].getBalance();
			calcInterest[i] = sortedLoans[i].getInterest() * 0.01;
			calcMinPayment[i] = sortedLoans[i].getMinPayment();
			finishedCalculating[i] = 0;
		}

		var iterator = 0;
		while(remainingLoans)	{
			J.LoanCalc.debug('remainingLoans: '+remainingLoans);
			var focusPayment = this.totalPayment;
			var firstPaymentPass = true;
			//Set monthly payments
			for(var i=0;i<this.initLoanCount();i++)	{
				if(finishedCalculating[i]==0)	{
					calcInterestPaid[i] = (calcBalance[i] * (calcInterest[i]/12));
					calcPrincPaid[i] = 0;
					sortedLoans[i].results.totalInterestPaid += calcInterestPaid[i];
					calcMonthlyPayment[i] = calcMinPayment[i];
					focusPayment = focusPayment - calcMinPayment[i];
				}
			}

			//Loops to ensure all focus payment is distributed
			while((focusPayment>0 || firstPaymentPass) && remainingLoans)	{
//				J.LoanCalc.debug('Focus Payment: '+focusPayment);
//				J.LoanCalc.debug('first Pass: '+firstPaymentPass);
				//Give rollover/focus money to priority loans
				for(var i=0;i<this.initLoanCount();i++)	{
					if(focusPayment > 0 && calcBalance[i] > 0)	{
						calcMonthlyPayment[i] += focusPayment;
						focusPayment = 0;
					}
				}
	
				//Payment pass
				for(var i=0;i<this.initLoanCount();i++)	{
//					J.LoanCalc.debug(calcBalance[i]);
					if(calcBalance[i] > 0)	{
					J.LoanCalc.debug('calcBalance[i] '+calcBalance[i]);
					J.LoanCalc.debug('monthly - interst '+(calcMonthlyPayment[i] - calcInterestPaid[i]));
						if(calcMonthlyPayment[i] - calcInterestPaid[i] < calcBalance[i])	{
							calcPrincPaid[i] = calcMonthlyPayment[i] - calcInterestPaid[i];
							calcBalance[i] -= calcPrincPaid[i];
						}
						else	{
							calcPrincPaid[i] = calcBalance[i];
							focusPayment = calcMonthlyPayment[i] - calcBalance[i] - calcInterestPaid[i];
							calcMonthlyPayment[i] = calcBalance[i] + calcInterestPaid[i];
							calcBalance[i] = 0;
							remainingLoans -= 1;
							J.LoanCalc.debug('decrement loans'+iterator);
							sortedLoans[i].results.payOffDate.setDate(currentMonth.getYear(),currentMonth.getMonth());	
						}
					}
				}
				firstPaymentPass = false;

			} //while ((focusPayment>0 || firstPaymentPass) && remainingLoans)


			//Send monthly results to ResultBar
			for(var i=0;i<this.initLoanCount();i++)	{
				if(finishedCalculating[i]==0)	{
					if(calcBalance[i]==0)
						finishedCalculating[i]=1;
					sortedLoans[i].results.drawMain(iterator,currentMonth,calcMonthlyPayment[i],calcPrincPaid[i],calcInterestPaid[i],calcBalance[i])
				}
			}
			currentMonth.increment();
			iterator++;

		}//while(remainingLoans)

		//Draw final
		for(var i=0;i<this.initLoanCount();i++)	{
			sortedLoans[i].results.drawFinal();
		}

		//Move around the divs
		for(var l=0;l<this.initLoanCount();l++)	{
			if(l==0)
				$('#allResultsContainer').prepend($('#resultsContainer'+sortedLoans[l].getUID()));
			else
				$('#resultsContainer'+sortedLoans[l].getUID()).insertAfter($('#resultsContainer'+sortedLoans[l-1].getUID()));
		}
	};



	this.sortLoans = function()	{
		//Sloppy O(n^2) sort, needs improvement
		var sortedArray = [];
		var storedIDs = [];
		var sortField = '';
		if(this.paymentType=='avalanche')
			sortField = 'interest';
		else
			sortField = 'balance';
		
		while(sortedArray.length < this.loanCount)	{
			var maxValue = 0;
			var currentMaxUID = 0;

			for(var s=0;s<this.initLoanCount();s++)		{
				var loanID = this.initLoanArray[s].uid;
				if(storedIDs.indexOf(loanID) == -1 && this.getInfo(loanID,sortField) > maxValue)	{
					currentMaxUID = loanID;
					maxValue = this.getInfo(loanID,sortField);
				}
			}
			storedIDs.push(currentMaxUID);
			sortedArray.push(this.getLoan(currentMaxUID));
		}
		J.LoanCalc.debug('SORTEDARRAY: '+sortedArray);
		if(this.paymentType=='avalanche')
			return sortedArray;
		else
			return sortedArray.reverse();	
	}

	this.initLoanCount = function()	{
		return this.initLoanArray.length;
	}
	
	this.refreshInitLoanArray = function()	{
		this.initLoanArray = [];
		for(var i=0;i<this.loanCount;i++)	{
			if(this.loanArray[i].initialized && !this.loanArray[i].deleted)
				this.initLoanArray.push(this.loanArray[i]);
		}

	}

	//Used when users delete the last valid loan
	this.clearData = function()	{

		this.autoCalc = 0;
		this.rolloverMonth.setCurrent();
		this.graph.reset();
		this.totalResults.reset();
	}

};
