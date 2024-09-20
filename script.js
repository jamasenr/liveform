document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("lead-form");
    const formSteps = Array.from(document.querySelectorAll(".form-step"));
    const nextButtons = document.querySelectorAll(".next-btn");
    const backBtn = document.getElementById("back-btn");
    const progress = document.querySelector(".progress");
    let currentStep = 0;
    const formData = {};

    const h1 = document.querySelector("h1");
    const p = document.querySelector("p");

    const stepTitles = [
        "Struggling to convert<br> ad clicks <span>into leads? 😢</span>", // Step 1
        "Phone Number?", // Step 2
        "Full Name?", // Step 3
        "Company Website?", // Step 4
        "How Much Do You Spend on Ads Today?", // Step 5
        "Which day of the week is best to call you?", // Step 6
        "What time of day is best to call you?", // Step 7
        "What state are you in?" // Step 8
    ];

    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem('sessionId', sessionId);
    }

    function generateSessionId() {
        return 'xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Send data without redirecting or affecting the user flow
    function sendDataToSheet(data) {
        const url = 'https://script.google.com/macros/s/AKfycbypHcLegjJjGkv6lLmE__7GJIaEC4skN1dPKniJ5Z7tIkpHcKL057odfl_esLFQiM-T/exec';
        fetch(url, {
            method: 'POST',
            mode: 'no-cors',  // Ensure CORS is handled
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Data successfully sent to Google Sheets');
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Define the handleSelection function that handles single and multi-select clicks
    function handleSelection(event, type) {
        const target = event.currentTarget;
        function handleSelection(event, type) {
    const target = event.currentTarget;

    if (type === 'single') {
        // Deselect all other select boxes
        const allSelectBoxes = target.parentElement.querySelectorAll('.select-box');
        allSelectBoxes.forEach(box => box.classList.remove('selected'));

        // Mark the clicked one as selected
        target.classList.add('selected');

        // Get the value of the selected option
        const value = target.getAttribute('data-value');

        // Update the hidden input field with the selected value
        const hiddenInput = document.getElementById('adSpend');
        hiddenInput.value = value;

        // Send the selected value to Google Sheets or log it
        sendDataToSheet({ sessionId, adSpend: value });  // Use 'adSpend' as the key directly
        } else if (type === 'multi') {
            // For multi-select boxes like Best Day and Time
            target.classList.toggle('selected');
            const selectedBoxes = target.parentElement.querySelectorAll('.multi-select.selected');
            const values = Array.from(selectedBoxes).map(box => box.getAttribute('data-value'));
            target.parentElement.nextElementSibling.value = values.join(', '); // Update hidden input
            const parentId = target.parentElement.id;
            sendDataToSheet({ sessionId, [parentId]: values.join(', ') });
        }
    }

    function updateFormSteps(newStepIndex) {
        if (currentStep === 0) {
            h1.classList.add("slide-out-left");
            p.classList.add("slide-out-left");
            h1.addEventListener('animationend', handleH1SlideOut, { once: true });
            p.addEventListener('animationend', handlePSlideOut, { once: true });
        } else {
            h1.classList.add("slide-out-left");
            h1.addEventListener('animationend', handleH1SlideOut, { once: true });
        }

        const currentFormStep = formSteps[currentStep];
        currentFormStep.classList.add("slide-out-left");
        currentFormStep.addEventListener('animationend', handleFormSlideOut, { once: true });

        function handleH1SlideOut() {
            h1.classList.remove("slide-out-left");
            if (newStepIndex === formSteps.length - 1) {
                h1.style.display = 'none';  // Hide the title on the success step
            } else {
                h1.innerHTML = stepTitles[newStepIndex];  // Update title for normal steps
                h1.classList.add("slide-in-right");
                h1.addEventListener('animationend', () => {
                    h1.classList.remove("slide-in-right");
                }, { once: true });
            }
        }

        function handlePSlideOut() {
            p.classList.remove("slide-out-left");
            if (newStepIndex === formSteps.length - 1) {
                p.style.display = 'none';  // Hide the paragraph on the success step
            } else {
                p.innerHTML = newStepIndex === 0 ? "We can help. Just answer a few questions." : "";
                p.classList.add("slide-in-right");
                p.addEventListener('animationend', () => {
                    p.classList.remove("slide-in-right");
                }, { once: true });
            }
        }

        function handleFormSlideOut() {
            currentFormStep.classList.remove("slide-out-left");
            currentFormStep.classList.remove("active");
            const nextFormStep = formSteps[newStepIndex];
            nextFormStep.classList.add("active", "slide-in-right");
            nextFormStep.addEventListener('animationend', () => {
                nextFormStep.classList.remove("slide-in-right");
            }, { once: true });

            updateBackButtonState(newStepIndex);
        }

        const progressPercent = ((newStepIndex) / (formSteps.length - 1)) * 100;
        progress.style.width = `${progressPercent}%`;

        currentStep = newStepIndex;
    }

    function updateBackButtonState(stepIndex) {
        if (stepIndex > 0) {
            backBtn.disabled = false;
            backBtn.classList.add("enabled");
        } else {
            backBtn.disabled = true;
            backBtn.classList.remove("enabled");
        }
    }

    // Update the event listeners for each step
    nextButtons.forEach(button => {
        button.addEventListener("click", () => {
            const currentFormStep = formSteps[currentStep];
            const inputs = currentFormStep.querySelectorAll('input, select');
            let valid = true;

            // Ensure that all required fields are filled
            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    valid = false;
                    input.reportValidity();
                }
            });

            if (valid) {
                const formElements = currentFormStep.querySelectorAll('input, select');
                formElements.forEach(input => {
                    if (input.type !== 'hidden') {
                        formData[input.name] = input.value;
                    }
                });

                const nextStepIndex = currentStep + 1;

                // Send data for each step but don't redirect
                switch (nextStepIndex) {
                    case 1: // Step 2: Phone Number
                        sendDataToSheet({ sessionId, email: formData.email });
                        break;
                    case 2: // Step 3: Full Name
                        sendDataToSheet({ sessionId, phone: formData.phone });
                        break;
                    case 3: // Step 4: Company Website
                        sendDataToSheet({ sessionId, name: formData.website });
                        break;
                    case 4: // Step 5: Ad Spend
                        sendDataToSheet({ sessionId, website: formData.adSpend });
                        break;
                    case 5: // Step 6: bestCall
                        sendDataToSheet({ sessionId, website: formData.callDaySelected });
                        break;
                    case 6: // Step 7: bestCall
                        sendDataToSheet({ sessionId, website: formData.callTimeSelected });
                        break;    
                    case 7: // Step 8: State
                        sendDataToSheet({ sessionId, state: formData.state });
                        break;
                    default:
                        break;
                }

                // Only move to the next step if all fields are filled
                if (valid) {
                    updateFormSteps(nextStepIndex);
                }
            }
        });
    });

    // Attach event listeners to single-select boxes (Step 5: Ad Spend)
    const selectBoxes = document.querySelectorAll('.select-box');
    selectBoxes.forEach(box => {
        box.addEventListener('click', (e) => {
            handleSelection(e, 'single');
        });
    });

    // Attach event listeners to multi-select boxes (Steps 6 & 7)
    const multiSelectBoxes = document.querySelectorAll('.multi-select');
    multiSelectBoxes.forEach(box => {
        box.addEventListener('click', (e) => {
            handleSelection(e, 'multi');
        });
    });

    backBtn.addEventListener("click", () => {
        if (currentStep > 0) {
            const previousStepIndex = currentStep - 1;
            updateFormSteps(previousStepIndex);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const finalData = {
            sessionId,
            email: formData.email,
            phone: formData.phone,
            name: formData.name,
            website: formData.website,
            adSpend: formData.adSpend,
            callDay: formData.callDaySelected,
            callTime: formData.callTimeSelected,
            state: formData.state
        };

        // Ensure no field is left blank
        if (Object.values(finalData).every(field => field)) {
            sendDataToSheet(finalData);
            form.reset();
            updateFormSteps(8);  // Final step to show success message
        } else {
            // Redirect user back to the first blank field
            const firstBlankStep = Object.keys(finalData).findIndex(key => !finalData[key]);
            updateFormSteps(firstBlankStep);
            alert("Please fill out all required fields.");
        }
    });
});

