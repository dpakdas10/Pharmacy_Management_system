



    // Get the link element
    var addToCartLink = document.getElementById('addToCartLink');

    // Add an event listener to the link for when it's clicked
    addToCartLink.addEventListener('click', function(event) {
        var qtyInput = document.getElementById('qtyInput');
        
        // Get the quantity value from the input field
        var qtyValue = qtyInput.value;

        // Append the quantity value as a query parameter to the link URL
        addToCartLink.href += '?qty=' + qtyValue;
    });

    