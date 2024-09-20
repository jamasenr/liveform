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
        "Looking for experts <br> to run Meta and Google ads?", // Step 1
        "Phone Number?", // Step 2
        "Full Name?", // Step 3
        "Company Website?", // Step 4
        "Select your ad spend:", // Step 5
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

    function sendDataToSheet(data) {
        const url = 'https://script.google.com/macros/s/AKfycbypHcLegjJjGkv6lLmE__7GJIaEC4skN1dPKniJ5Z7tIkpHcKL057odfl_esLFQiM-T/exec';
        fetch(url, {
            method: 'POST',
            mode: 'no-cors', // Necessary due to CORS limitations with Google Apps Script
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(() => {
            // Since the response is opaque, we can't confirm success
            console.log('Data sent successfully:', data);
        })
        .catch(error => {
            console.error('Error sending data:', error);
            alert('An error occurred while sending your data. Please try again.');
        });
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

    function handleSelection(event, type) {
        const target = event.currentTarget;

        if (type === 'single') {
            // Remove 'selected' class from all select boxes
            const allSelectBoxes = target.parentElement.querySelectorAll('.select-box');
            allSelectBoxes.forEach(box => box.classList.remove('selected'));

            // Add 'selected' class to the clicked box
            target.classList.add('selected');

            // Get the value from the selected box's data-value attribute
            const value = target.getAttribute('data-value');

            // Update the hidden input field with the selected value
            const hiddenInput = target.parentElement.querySelector('input[type="hidden"]');
            hiddenInput.value = value;

            // Get the input's name attribute to use as the key
            const inputName = hiddenInput.name;

            // Update formData
            formData[inputName] = value;

            // Send data to Google Sheet or any external system with the correct key
            sendDataToSheet({ sessionId, [inputName]: value });
        } else if (type === 'multi') {
            // Toggle 'selected' class
            target.classList.toggle('selected');

            // Get all selected values
            const selectedBoxes = target.parentElement.querySelectorAll('.multi-select.selected');
            const values = Array.from(selectedBoxes).map(box => box.getAttribute('data-value'));

            // Update the hidden input field with the selected values
            target.parentElement.nextElementSibling.value = values.join(', ');

            // Get the parent ID to use as the key
            const parentId = target.parentElement.id;

            // Update formData
            formData[parentId] = values.join(', ');

            // Send data to Google Sheet or any external system
            sendDataToSheet({ sessionId, [parentId]: values.join(', ') });
        }
    }

    // Attach event listeners to all .select-box elements (single select)
    document.querySelectorAll('.select-box').forEach(box => {
        box.addEventListener('click', (event) => handleSelection(event, 'single'));
    });

    // Attach event listeners to all .multi-select elements (multi select)
    document.querySelectorAll('.multi-select').forEach(box => {
        box.addEventListener('click', (event) => handleSelection(event, 'multi'));
    });

    updateBackButtonState(currentStep);

    nextButtons.forEach(button => {
        button.addEventListener("click", () => {
            const currentFormStep = formSteps[currentStep];
            const inputs = currentFormStep.querySelectorAll('input, select');
            let valid = true;

            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    valid = false;
                    input.reportValidity();
                }
            });

            if (valid) {
                const nextStepIndex = currentStep + 1;

                // Update form titles and proceed to next step
                updateFormSteps(nextStepIndex);

                // Increment step
                currentStep = nextStepIndex;

                updateBackButtonState(currentStep);
            }
        });
    });

    backBtn.addEventListener("click", () => {
        if (currentStep > 0) {
            const previousStepIndex = currentStep - 1;
            updateFormSteps(previousStepIndex);
            currentStep = previousStepIndex;
            updateBackButtonState(currentStep);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect all form data
        const finalData = {
            sessionId,
            ...formData,
            state: document.getElementById('state').value // Directly get the state value
        };

        console.log('Submitting final data:', finalData); // Debugging

        // Send all data at once
        sendDataToSheet(finalData);

        // Reset the form and show success message
        form.reset();
        updateFormSteps(formSteps.length - 1);  // Final step to show success message
    });
});
