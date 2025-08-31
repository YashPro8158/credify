 // Page navigation function
            // EMI Calculator functionality
        function updateEMICalculator() {
            const loanAmount = document.getElementById('loanAmount');
            const interestRate = document.getElementById('interestRate');
            const tenure = document.getElementById('tenure');
            const loanAmountValue = document.getElementById('loanAmountValue');
            const interestRateValue = document.getElementById('interestRateValue');
            const tenureValue = document.getElementById('tenureValue');
            const emiResult = document.getElementById('emiResult');

            if (loanAmount && interestRate && tenure && loanAmountValue && interestRateValue && tenureValue && emiResult) {
                loanAmount.addEventListener('input', function() {
                    loanAmountValue.textContent = '₹' + parseInt(this.value).toLocaleString('en-IN');
                    calculateEMI();
                });

                interestRate.addEventListener('input', function() {
                    interestRateValue.textContent = this.value + '%';
                    calculateEMI();
                });

                tenure.addEventListener('input', function() {
                    tenureValue.textContent = this.value + ' months';
                    calculateEMI();
                });

                function calculateEMI() {
                    const P = parseFloat(loanAmount.value);
                    const R = parseFloat(interestRate.value) / 12 / 100;
                    const N = parseFloat(tenure.value);
                    
                    const EMI = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
                    emiResult.textContent = '₹' + Math.round(EMI).toLocaleString('en-IN');
                }

                // Initial calculation
                calculateEMI();
            }
        }

        // Initialize EMI calculator when page loads
        document.addEventListener('DOMContentLoaded', function() {
            updateEMICalculator();
        });