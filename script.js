document.getElementById('paymentForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const numberOfTickets = document.getElementById('numberOfTickets').value;

    const response = await fetch('/api/payment/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phoneNumber, numberOfTickets })
    });

    if (response.redirected) {
        window.location.href = response.url;
    } else {
        console.error('Failed to redirect to payment gateway.');
    }
});
