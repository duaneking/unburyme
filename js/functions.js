$(function()	{

	var loanApp = new J.LoanCalc.LoanApp();
	loanApp.createLoan();
/*
 * Links/Tooltips
 */
	$('.link').click(function ()	{
		if($(this).attr('id')=='link_help')	{
			$('#help').show();
			$('#about').hide();
			$('#feedback').hide();
		}
		else if($(this).attr('id')=='link_about')	{
			$('#help').hide();
			$('#about').show();
			$('#feedback').hide();
		}
		else if($(this).attr('id')=='link_feedback')	{
			$('#help').hide();
			$('#about').hide();
			$('#feedback').show();
		}
	});

	$('.linkClose').click(function ()	{
		$('.moreInfo').hide()
	});


	$('.help').mouseover(function (e)	{
		var x = e.pageX + 30;
		var y = e.pageY - 20;
		$('#helpPopup').css({left:x+'px',top:y+'px'});
		
		if($(this).attr('id')=='totalMonthlyPaymentHelp')
			$('#help_tmp').show();
		else if($(this).attr('id')=='paymentTypeHelp')
			$('#help_pt').show();
	});

	$('.help').mouseout(function ()	{
		if($(this).attr('id')=='totalMonthlyPaymentHelp')
			$('#help_tmp').hide();
		else if($(this).attr('id')=='paymentTypeHelp')
			$('#help_pt').hide();
	});



/*
 * Creating/destroying Loans, Payment Type
 */	
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
		calculate();
		
	});

	$('.createLoanPlus').live('click', function ()	{
		loanApp.createLoan();
	});
	
	$('.destroyLoan').live('click', function ()	{
		var deleteID = $(this).attr('id').substr(6);
		loanApp.destroyLoan(deleteID);
		calculate();
	});

/*
 * Slider
 */

	$('#paymentSlider').slider({
		value: 100,
		min: 0,
		max: 5000,
		animate: true,
		slide: function(event,ui)	{
			$('#totalMonthlyPayment').val(logPositionToPayment(ui.value));
			loanApp.updatePayment(logPositionToPayment(ui.value));
			sliderCalculate(logPositionToPayment(ui.value));
		}
	});

	var timeout;
	var sliderCalculate = function(position)	{
		if(timeout)
			clearTimeout(timeout);
		timeout = setTimeout(function () {
			if(loanApp.recalculate)			
				$('input.uninitialized').addClass('invalidField');
			if(logPositionToPayment(position) < loanApp.totalMinPayment)
				$('#paymentSlider').slider('option','value',logPaymentToPosition(loanApp.totalMinPayment));
			calculate();
		}, loanApp.config.sliderWaitToCalculate);
	};

/*
 * Not a fan of log curve, needs tweeked; linear for now
 */

	logPaymentToPosition = function(payment)	{
		//return (payment.log2() / loanApp.config.sliderMax.log2()) * 1000;
		return payment;
	};	
	logPositionToPayment = function(pos)	{
		/*
		var payment = (pos / 1000) * loanApp.config.sliderMax.log2();
		payment = Math.pow(2,payment);
		payment = Math.round(payment*100)/100;
		return payment;
		*/
		return pos;
	};	



/*
 * Viewing Results
 */
	$('.resultsContainer').live('click', function ()	{
		var uid = $(this).attr('id').substr(16);
		loanApp.getLoan(uid).results.click();
	});

	$('.graphView').click(function ()	{
		if($(this).attr('id')=='graph_princRemaining')	{
			loanApp.graph.draw('princRemaining');		
		}
		else if($(this).attr('id')=='graph_princPaid')	{
			loanApp.graph.draw('princPaid');		
		}
		else if($(this).attr('id')=='graph_totalInterestPaid')	{
			loanApp.graph.draw('totalInterestPaid');		
		}
		else if($(this).attr('id')=='graph_monthlyPayment')	{
			loanApp.graph.draw('monthlyPayment');		
		}
	});
/*
 * Events
 */
	$('input').live('change', function()	{
		J.LoanCalc.debug('recalc: '+loanApp.recalculate);
		var uid;
		var field;
		var value = $(this).val();
		
		// Get loan UID and set field
		if($(this).hasClass('loanNameInput'))	{
			uid = $(this).attr('id').substr(13);
			field = 'name';
			J.LoanCalc.debug('setting: '+uid+'name');
		}
		else if($(this).hasClass('loanBalanceInput'))	{
			uid = $(this).attr('id').substr(16);
			field = 'balance';
			J.LoanCalc.debug('setting: '+uid+'balance');
		}
		else if($(this).hasClass('loanPaymentInput'))	{
			uid = $(this).attr('id').substr(16);
			field = 'minPayment';
			J.LoanCalc.debug('setting: '+uid+'minpayment');
		}
		else if($(this).hasClass('loanInterestInput'))	{
			uid = $(this).attr('id').substr(17);
			field = 'interest';
			J.LoanCalc.debug('setting: '+uid+'interest');
		}
		else	{ //#totalMonthlyPayment
			field = 'totalMonthlyPayment';
		}

		//If valid dollar amount input, set field
		//Move slider if minPayment increases or totalMonthlyPayment changes
		if(validate(value) && field!='name')	{
			$(this).removeClass('invalidField');
			value = numberFormat(value);
			$(this).val(value);
			if(field=='totalMonthlyPayment')	{
				loanApp.updatePayment(value);
				$('#paymentSlider').slider('option','value',logPaymentToPosition(value));				
			}
			else if(field=='minPayment')	{
				loanApp.updateLoan(uid,field,value);
				$('#paymentSlider').slider('option','value',logPaymentToPosition(loanApp.totalPayment));
			}
			else
				loanApp.updateLoan(uid,field,value);
		}
		//Invalid dollar amount, make input box red
		else if(!$(this).hasClass('invalidField') && field!='name')	{
			$(this).addClass('invalidField');
			if(value=='')
				$(this).val('')
		}
		
		/*
		 * No restrictions on name field
		 * Set as "Loan n" if not entered
		 */
		if(field=='name')	{
			if(value=='')	{
				value = 'Loan '+(parseInt(uid)+1);
				$(this).val(value);
				$(this).css('color','#cccccc');
			}
			else
				$(this).css('color','#444444');
			loanApp.updateLoan(uid,field,value);
		}

		//If it's an initialized loan, attempt to recalculate
		//and make all uninitialized inputs invalid
		if(!$('#loanBarInput'+uid).hasClass('uninitialized') && loanApp.recalculate)	{
			$('input.uninitialized').addClass('invalidField');
			calculate();
		}
	});



	$('.calculate').click(function ()	{
		if($('input').hasClass('uninitialized'))	
			$('input.uninitialized').addClass('invalidField');	
		else
			calculate(1);
	});

	var calculate = function(firstCall)	{
		if(firstCall || loanApp.recalculate)	{
			//If no invalidFields, calculate and set blank fields to default values
			if($('input').hasClass('invalidField'))	{
				//Flash red divs?
			}
			else	{
				if(!loanApp.recalculate)
					$('.calculate').fadeOut(loanApp.config.fadeSpeed);
				loanApp.calculate();			
			}
		}
	};

	/*
	 *	validate(s)
	 */

	var validate = function(s)	{
		var validChars = "0123456789., ";
		var validTest = true;
		var char;
		for(i=0;i<s.length && validTest==true;i++)	{
			char = s.charAt(i);
			//if(char=='.')
			//	decimalCount++;
			if(validChars.indexOf(char) == -1)
				validTest = false;
		}
		if(s=='')
			validTest = false;
		return validTest;
	};

	var numberFormat = function(s)	{
		s = s.replace(' ','');
		s = s.replace(',','');
		s = parseFloat(s);
		return s;	
	};


});



/*
 * From Safalra (Stephen Morley)'s Number-extension.js
 */

Number.prototype.log2 =
	function(){
		return Math.log(this) / Math.LN2;
};



/*
 * IE Array.indexOf fix
 */

if(!Array.indexOf){
	Array.prototype.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i]==obj){
				return i;
			}
		}
		return -1;
	}
};


