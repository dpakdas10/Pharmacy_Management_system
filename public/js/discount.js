    // JavaScript function to handle key press event
    function handleKeyPress(event) {
        if (event.key === "Enter") {
            calculateTotal();
        }
    }

    function calculateTotal() {
        const subtotal = (document.getElementById("subtotal").innerText.replace(/[^\d.]/g, ''));
        const discount = (document.getElementById("discount").value);
            // console.log(discount);
            // console.log(subtotal);

            let total = subtotal - discount;
            console.log(total);
        document.getElementById("totalAmount").innerText = total;
    }
