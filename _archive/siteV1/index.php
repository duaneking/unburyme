
<html>

<? include('header.php'); ?>

<body>
<div id='enclosure'>
<div id='header'>SWEET LOAN APP</div>
<div id='controlBar'>
	<div class='totalMonthlyPayment'>
		<div class='fieldTitle'>Total Monthly Payment
			<div class='help'></div>
		</div>
		<div class='fieldInput'>$<input id='totalMonthlyPayment' name='totalMonthlyPayment' /></div>
	</div>
	<div class='paymentType'>
		<div class='fieldTitle'>Payment Type
			<div class='help'></div>
		</div>
		<div class='paymentTypeSelect'>
			<a href='#' class='paymentTypeButtonLink avaLink'><div id='avalanche' class='selectedPaymentType paymentTypeButton'>Avalanche</div></a>
			<a href='#' class='paymentTypeButtonLink sfLink'><div id='snowfall' class='unselectedPaymentType paymentTypeButton'>Snowfall</div></a>
		</div>
	</div>
</div>
<div id='loanBarInputContainer'>
</div> <!-- loanBarInputContainer -->
<a href='#' class='createLoan'><div class='createLoanPlus'></div></a>
<a href='#' class='calculate'>Calculate!</a>
<div id='resultsContainer'>

</div> <!-- resultsContainer -->

</div> <!--enclosure-->
</body>
</html>
