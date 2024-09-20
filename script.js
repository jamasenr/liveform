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

    function sendDataToSheet(data) {
        const url = 'https://script.google.com/macros/s/AKfycbypHcLegjJjGkv6lLmE__7GJIaEC4skN1dPKniJ5Z7tIkpHcKL057odfl_esLFQiM-T/exec';
        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                updateFormSteps(formSteps.length - 1);  // Final success step
            } else {
               
            }
        })
        .catch(error => {
           
            
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
            // Find all select boxes and remove the 'selected' class
            const allSelectBoxes = target.parentElement.querySelectorAll('.select-box');
            allSelectBoxes.forEach(box => box.classList.remove('selected'));

            // Add 'selected' class to the clicked box
            target.classList.add('selected');

            // Get the value from the selected box's data-value attribute
            const value = target.getAttribute('data-value');
            // Update the hidden input field with the selected value
            target.parentElement.nextElementSibling.value = value;

            // Handle label assignment for data submission
            const previousSibling = target.parentElement.previousElementSibling;
            const label = previousSibling ? previousSibling.textContent.trim() : 'defaultLabel';

            // Send data to Google Sheet or any external system
            sendDataToSheet({ sessionId, [label]: value });
        } else if (type === 'multi') {
            target.classList.toggle('selected');
            const selectedBoxes = target.parentElement.querySelectorAll('.multi-select.selected');
            const values = Array.from(selectedBoxes).map(box => box.getAttribute('data-value'));
            target.parentElement.nextElementSibling.value = values.join(', ');
            const parentId = target.parentElement.id;
            sendDataToSheet({ sessionId, [parentId]: values.join(', ') });
        }
    }

    // Attach event listeners to all .select-box elements
    document.querySelectorAll('.select-box').forEach(box => {
        box.addEventListener('click', (event) => handleSelection(event, 'single'));
    });

    // Attach event listeners to all .multi-select elements
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
                const formElements = currentFormStep.querySelectorAll('input, select');
                formElements.forEach(input => {
                    formData[input.name] = input.value;
                });

                const nextStepIndex = currentStep + 1;

                switch (nextStepIndex) {
                    case 1:
                        sendDataToSheet({ sessionId, email: formData.email });
                        break;
                    case 2:
                        sendDataToSheet({ sessionId, phone: formData.phone });
                        break;
                    case 3:
                        sendDataToSheet({ sessionId, name: formData.name });
                        break;
                    case 4:
                        sendDataToSheet({ sessionId, website: formData.website });
                        break;
                    case 7:
                        sendDataToSheet({ sessionId, state: formData.state });
                        break;
                    default:
                        break;
                }

                updateFormSteps(nextStepIndex);
            }
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
            adSpend: document.getElementById('adSpend').value,
            callDay: document.getElementById('callDaySelected').value,
            callTime: document.getElementById('callTimeSelected').value,
            state: formData.state
        };
        sendDataToSheet(finalData);
        form.reset();
        updateFormSteps(formSteps.length - 1);  // Final step to show success message
    });
});
