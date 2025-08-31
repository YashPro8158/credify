const checklistData = {
    Proprietor: {
        applicant: [
            "KYC (Aadhaar card, PAN card & photo)",
            "GST RC, returns (1 year) & Udyam registration",
            "Latest 3 year ITR, Computation, Financials & Form 3CB 3CD",
            "Latest 3 year Form 26AS",
            "Current & saving account banking statements - Latest 1 year"
        ],
        coApplicantIncome: [
            "KYC (Aadhaar card, PAN card & photo)",
            "Latest 3 year ITR, Computation",
            "Latest 3 year Form 26AS",
            "Saving account banking statements - Latest 1 year"
        ],
        coApplicantNonIncome: [
            "KYC (Aadhaar card, PAN card & photo)"
        ]
    },
    Partnership: {
        applicant: [
            "Company PAN card",
            "Partnership deed",
            "GST RC, returns (1 year) & Udyam registration",
            "Latest 3 year ITR, Computation, Financials & Form 3CB 3CD",
            "Latest 3 year Form 26AS",
            "Current account banking statements - Latest 1 year"
        ],
        additional: [
            "All partner's documents:",
            "KYC (Aadhaar card, PAN card & photo)",
            "Latest 3 year ITR, Computation",
            "Latest 3 year Form 26AS",
            "Saving account banking statements - Latest 1 year"
        ]
    },
    PvtLtd: {
        applicant: [
            "Company PAN card",
            "AOA, MOA, COI (Certificate of Incorporation)",
            "List of shareholders & directors (as on date CA attested)",
            "GST RC, returns (1 year) & Udyam registration",
            "Latest 3 year ITR, Computation, Financials & Form 3CA 3CD, Independent report & director report",
            "Latest 3 year Form 26AS",
            "Current account banking statements - Latest 1 year"
        ],
        additional: [
            "All Director's documents:",
            "KYC (Aadhaar card, PAN card & photo)",
            "Latest 3 year ITR, Computation",
            "Latest 3 year Form 26AS",
            "Saving account banking statements - Latest 1 year"
        ]
    },
    Salaried: {
        applicant: [
            "KYC (Aadhaar card, PAN card & photo)",
            "Latest 3 month salary slip",
            "Latest 2 years Form 16",
            "Salary credit banking statements - Latest 1 year"
        ],
        coApplicantIncome: [
            "KYC (Aadhaar card, PAN card & photo)",
            "Latest 3 month salary slip",
            "Latest 2 years Form 16",
            "Salary credit banking statements - Latest 1 year"
        ],
        coApplicantNonIncome: [
            "KYC (Aadhaar card, PAN card & photo)"
        ]
    }
};

const loanSpecificData = {
    HLBTTopup: [
        "BT Loan documents (Sanction Letter, Repayment Schedule, SOA, FC & LOD)"
    ],
    LAPBTTopup: [
        "BT Loan documents (Sanction Letter, Repayment Schedule, SOA, FC & LOD)"
    ],
    NewCarLoan: [
        "Proforma Invoice"
    ],
    OldCarLoan: [
        "Car RC"
    ]
};

const securedLoanDocuments = [
    "Property documents (applicable for all secured loans regardless of applicant type)"
];

const securedLoanTypes = ["FreshHomeLoan", "FreshLAP", "HLBTTopup", "LAPBTTopup"];

document.getElementById('generateBtn').addEventListener('click', generateChecklist);

function generateChecklist() {
    const applicantType = document.getElementById('applicantType').value;
    const coApplicantType = document.getElementById('coApplicantType').value;
    const loanType = document.getElementById('loanType').value;
    
    if (!applicantType || !coApplicantType || !loanType) {
        alert('Please select all options to generate the checklist.');
        return;
    }
    
    const resultContainer = document.getElementById('resultContainer');
    const checklistTitle = document.getElementById('checklistTitle');
    const applicantSection = document.getElementById('applicantSection');
    const coApplicantSection = document.getElementById('coApplicantSection');
    const additionalSection = document.getElementById('additionalSection');
    const loanSpecificSection = document.getElementById('loanSpecificSection');
    const securedLoanSection = document.getElementById('securedLoanSection');
    
    const applicantChecklist = document.getElementById('applicantChecklist');
    const coApplicantChecklist = document.getElementById('coApplicantChecklist');
    const additionalChecklist = document.getElementById('additionalChecklist');
    const loanSpecificChecklist = document.getElementById('loanSpecificChecklist');
    const securedLoanChecklist = document.getElementById('securedLoanChecklist');
    
    // Clear previous results
    applicantChecklist.innerHTML = '';
    coApplicantChecklist.innerHTML = '';
    additionalChecklist.innerHTML = '';
    loanSpecificChecklist.innerHTML = '';
    securedLoanChecklist.innerHTML = '';
    
    // Set title
    let loanTypeName = loanType;
    switch(loanType) {
        case 'FreshHomeLoan': loanTypeName = 'Fresh Home Loan'; break;
        case 'FreshLAP': loanTypeName = 'Fresh LAP'; break;
        case 'HLBTTopup': loanTypeName = 'HL BT Topup'; break;
        case 'LAPBTTopup': loanTypeName = 'LAP BT Topup'; break;
        case 'CGTMSE': loanTypeName = 'CGTMSE'; break;
        case 'NewCarLoan': loanTypeName = 'New Car Loan'; break;
        case 'OldCarLoan': loanTypeName = 'Old Car Loan'; break;
    }
    checklistTitle.textContent = `${applicantType} - ${loanTypeName} Checklist`;
    
    // Populate applicant checklist
    if (checklistData[applicantType] && checklistData[applicantType].applicant) {
        applicantSection.classList.remove('hidden');
        checklistData[applicantType].applicant.forEach(item => {
            const li = document.createElement('li');
            li.className = 'flex items-start checklist-item';
            li.innerHTML = `
                <svg class="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>${item}</span>
            `;
            applicantChecklist.appendChild(li);
        });
    } else {
        applicantSection.classList.add('hidden');
    }
    
    // Populate co-applicant checklist
    if (coApplicantType !== 'None') {
        const coApplicantKey = coApplicantType === 'Income' ? 'coApplicantIncome' : 'coApplicantNonIncome';
        
        if (checklistData[applicantType] && checklistData[applicantType][coApplicantKey]) {
            coApplicantSection.classList.remove('hidden');
            checklistData[applicantType][coApplicantKey].forEach(item => {
                const li = document.createElement('li');
                li.className = 'flex items-start checklist-item';
                li.innerHTML = `
                    <svg class="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>${item}</span>
                `;
                coApplicantChecklist.appendChild(li);
            });
        } else {
            coApplicantSection.classList.add('hidden');
        }
    } else {
        coApplicantSection.classList.add('hidden');
    }
    
    // Populate additional checklist (for Partnership and PvtLtd)
    if (checklistData[applicantType] && checklistData[applicantType].additional) {
        additionalSection.classList.remove('hidden');
        checklistData[applicantType].additional.forEach(item => {
            const li = document.createElement('li');
            li.className = 'flex items-start checklist-item';
            
            // Check if this is a header item (ends with :)
            if (item.endsWith(':')) {
                li.innerHTML = `
                    <span class="font-medium text-gray-800">${item}</span>
                `;
            } else {
                li.innerHTML = `
                    <svg class="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>${item}</span>
                `;
            }
            additionalChecklist.appendChild(li);
        });
    } else {
        additionalSection.classList.add('hidden');
    }
    
    // Populate loan-specific checklist
    if (loanSpecificData[loanType]) {
        loanSpecificSection.classList.remove('hidden');
        loanSpecificData[loanType].forEach(item => {
            const li = document.createElement('li');
            li.className = 'flex items-start checklist-item';
            li.innerHTML = `
                <svg class="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>${item}</span>
            `;
            loanSpecificChecklist.appendChild(li);
        });
    } else {
        loanSpecificSection.classList.add('hidden');
    }
    
    // Populate secured loan documents if applicable
    if (securedLoanTypes.includes(loanType)) {
        securedLoanSection.classList.remove('hidden');
        securedLoanDocuments.forEach(item => {
            const li = document.createElement('li');
            li.className = 'flex items-start checklist-item';
            li.innerHTML = `
                <svg class="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>${item}</span>
            `;
            securedLoanChecklist.appendChild(li);
        });
    } else {
        securedLoanSection.classList.add('hidden');
    }
    
    // Show result container
    resultContainer.classList.remove('hidden');
}