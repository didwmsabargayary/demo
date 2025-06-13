// Menu items data
const menuItems = [
    { id: 1, name: 'Milk Tea (गायखेर साहा)', price: 10, image: 'cuting chi.jpg' },
    { id: 2, name: 'Lal tea (लाल साहा)', price: 10, image: 'lal.jpg' },
    { id: 15, name: 'Biscuit (बिस्कुट)', price: 15, image: 'bis.jpeg' },
    { id: 10, name: 'Papor (पापोर)', price: 5, image: 'papor.jpeg' },
    { id: 4, name: 'Guguni (गुगुनी)', price: 10, image: 'guguni.jpeg' },
    { id: 16, name: 'Jhal Muri (जाल मुरि)', price: 10, image: 'JH.jpeg' },
    //{ id: 3, name: 'Porota (परोठा)', price: 20, image: 'porota.jpg' },
    { id: 7, name: 'Pan Egg (दावदै)', price: 15, image: 'egg.jpeg' },
    { id: 9, name: 'Maggi (मेगि)', price: 20, image: 'Maggi.jpg' },
    { id: 6, name: 'Water Bottle (दै बोतल)', price: 10, image: 'water.jpeg' },
    //{ id: 3, name: 'Porota (परोठा)', price: 20, image: 'porota.jpg' },
    { id: 5, name: 'Cigarette (चिगरेट)', price: 10, image: 'ch.jpg' },
    // { id: 8, name: 'Roti (रोटी)', price: 10, image: 'roti.webp' },         
    { id: 11, name: 'Pan (गय पाथै)', price: 5, image: 'goy.jpeg' },
    { id: 15, name: 'Imli Kick', price: 1, image: 'em.jpeg' }
    //{ id: 12, name: 'Puri (पुरी)', price: 10, image: 'puri.jpg' },
   // { id: 13, name: 'Sugar Cane Juice (खुसेर बिदै)', price: 20, image: 'suger.jpg' }
   // { id: 14, name: 'Chow Mein (चाउ मेन)', price: 60, image: 'R.jpg' },
    
];

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const menuGrid = document.querySelector('.menu-grid');
const itemsList = document.querySelector('.items-list');
const selectedItems = document.querySelector('.selected-items');
const totalAmount = document.getElementById('total-amount');
const generateInvoiceBtn = document.getElementById('generate-invoice');
const modal = document.getElementById('invoice-modal');
const closeModal = document.querySelector('.close');
const invoiceDetails = document.getElementById('invoice-details');
const printInvoiceBtn = document.getElementById('print-invoice');

// Data structure
let customers = {};
let dues = [];
let isAdminLoggedIn = false;

// Initialize from localStorage or set defaults
function initializeData() {
    try {
        const savedDues = localStorage.getItem('dues');
        dues = savedDues ? JSON.parse(savedDues) : [];
        console.log('Loaded dues:', dues);
        updateCustomerSummary();
        renderCustomerList();
    } catch (error) {
        console.error('Error loading data:', error);
        dues = [];
    }
}

function updateCustomerSummary() {
    customers = {};
    dues.forEach(due => {
        if (!customers[due.customerName]) {
            customers[due.customerName] = {
                totalDue: 0,
                lastTransaction: due.date,
                transactions: []
            };
        }
        
        customers[due.customerName].totalDue += due.items.reduce((total, item) => total + item.total, 0);
        customers[due.customerName].transactions.push(due);
        
        if (new Date(due.date) > new Date(customers[due.customerName].lastTransaction)) {
            customers[due.customerName].lastTransaction = due.date;
        }
    });
    console.log('Updated customers:', customers);
}

function renderCustomerList() {
    const customerList = document.getElementById('customer-list');
    if (!customerList) {
        console.error('Customer list element not found');
        return;
    }
    
    // Clear the existing list
    customerList.innerHTML = '';
    
    // Check if there are any customers
    if (Object.keys(customers).length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" style="text-align: center;">No customers found</td>';
        customerList.appendChild(emptyRow);
        return;
    }
    
    // Add each customer to the list
    Object.entries(customers).forEach(([name, data]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="customer-name" onclick="showCustomerDetails('${name}')">${name}</span>
            </td>
            <td>₹${data.totalDue.toFixed(2)}</td>
            <td>${formatDate(data.lastTransaction)}</td>
            <td>${data.totalDue > 0 ? '<span class="status-pending">Pending</span>' : '<span class="status-paid">Paid</span>'}</td>
            <td>
               <!-- <button class="action-btn" onclick="editCustomer('${name}')">Edit</button> -->
                <button class="action-btn" onclick="printCustomerDues('${name}', groupTransactionsByDate(customers['${name}'].transactions))">Print</button>
               <!-- <button class="action-btn delete" onclick="deleteCustomer('${name}')">Delete</button> -->
            </td>
        `;
        customerList.appendChild(row);
    });
    console.log('Rendered customer list with', Object.keys(customers).length, 'customers');
}

function showCustomerDetails(customerName) {
    const modal = document.getElementById('customer-modal');
    const modalCustomerName = document.getElemen
    tById('modal-customer-name');
    const modalTotalDue = document.getElementById('modal-total-due');
    const vouchersContainer = document.querySelector('.vouchers-by-date');
    
    modalCustomerName.textContent = customerName;
    modalTotalDue.textContent = customers[customerName].totalDue.toFixed(2);
    
    // Group transactions by date
    const groupedTransactions = groupTransactionsByDate(customers[customerName].transactions);
    
    // Render grouped transactions
    vouchersContainer.innerHTML = '';
    Object.entries(groupedTransactions).forEach(([date, transactions]) => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'date-group';
        dateGroup.innerHTML = `
            <h3>${formatDate(date)}</h3>
            <table class="voucher-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => t.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price.toFixed(2)}</td>
                            <td>₹${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    `).join('')).join('')}
                </tbody>
            </table>
        `;
        vouchersContainer.appendChild(dateGroup);
    });
    
    // Add print button event listener
    const printButton = document.getElementById('print-customer-dues');
    printButton.onclick = () => printCustomerDues(customerName, groupedTransactions);
    
    modal.style.display = 'block';
}

function groupTransactionsByDate(transactions) {
    return transactions.reduce((groups, transaction) => {
        const date = transaction.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {});
}

// Export functionality
function exportData() {
    const data = {
        customers: Object.entries(customers).map(([name, data]) => ({
            name,
            totalDue: data.totalDue,
            lastTransaction: data.lastTransaction,
            transactions: data.transactions
        }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dues_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing application...');
    initializeData();
    
    // Setup event listeners
    document.getElementById('export-data').addEventListener('click', exportData);
    
    // Setup Add Customer functionality
    const addCustomerBtn = document.getElementById('add-customer-btn');
    const addCustomerForm = document.getElementById('add-customer-form');
    const customerForm = document.getElementById('customer-form');
    const cancelAddCustomerBtn = document.getElementById('cancel-add-customer');
    
    if (addCustomerBtn && addCustomerForm) {
        addCustomerBtn.addEventListener('click', () => {
            addCustomerForm.style.display = 'block';
        });
    }
    
    if (cancelAddCustomerBtn && addCustomerForm) {
        cancelAddCustomerBtn.addEventListener('click', () => {
            addCustomerForm.style.display = 'none';
            if (customerForm) customerForm.reset();
        });
    }
    
    if (customerForm) {
        customerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('customer-name');
            const amountInput = document.getElementById('due-amount');
            
            if (!nameInput || !amountInput) {
                console.error('Form inputs not found');
                return;
            }
            
            const customerName = nameInput.value.trim();
            const dueAmount = parseFloat(amountInput.value);
            
            if (!customerName) {
                alert('Please enter a customer name');
                return;
            }
            
            if (isNaN(dueAmount) || dueAmount < 0) {
                alert('Please enter a valid due amount');
                return;
            }
            
            if (addNewCustomer(customerName, dueAmount)) {
                customerForm.reset();
                addCustomerForm.style.display = 'none';
            }
        });
    }
    
    // Setup search functionality
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#customer-list tr');
            
            rows.forEach(row => {
                const nameCell = row.querySelector('.customer-name');
                if (nameCell) {
                    const name = nameCell.textContent.toLowerCase();
                    row.style.display = name.includes(searchTerm) ? '' : 'none';
                }
            });
        });
    }
    
    // Setup sorting functionality
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const tbody = document.getElementById('customer-list');
            if (!tbody) return;
            
            const rows = Array.from(tbody.getElementsByTagName('tr'));
            
            rows.sort((a, b) => {
                const aValue = getSortValue(a, sortBy);
                const bValue = getSortValue(b, sortBy);
                return sortBy === 'name' ? aValue.localeCompare(bValue) : bValue - aValue;
            });
            
            // Clear and re-append sorted rows
            tbody.innerHTML = '';
            rows.forEach(row => tbody.appendChild(row));
        });
    }
});

function getSortValue(row, sortBy) {
    switch (sortBy) {
        case 'name':
            const nameCell = row.querySelector('.customer-name');
            return nameCell ? nameCell.textContent : '';
        case 'amount':
            const amountCell = row.querySelector('td:nth-child(2)');
            return amountCell ? parseFloat(amountCell.textContent.replace('₹', '')) : 0;
        case 'date':
            const dateCell = row.querySelector('td:nth-child(3)');
            return dateCell ? new Date(dateCell.textContent) : new Date(0);
        default:
            return 0;
    }
}

// Helper functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize menu grid
function initializeMenu() {
    const menuGrid = document.querySelector('.menu-grid');
    menuGrid.innerHTML = '';
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p class="price">₹${item.price.toFixed(2)}</p>
        `;
        menuGrid.appendChild(menuItem);
    });
}

// Function to initialize items list for invoice
function initializeItemsList() {
    const itemsList = document.querySelector('.items-list');
    if (!itemsList) return;
    
    itemsList.innerHTML = '';
    menuItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-checkbox';
        itemDiv.innerHTML = `
            <input type="checkbox" id="item-${item.id}" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
            <label for="item-${item.id}">${item.name} - ₹${item.price.toFixed(2)}</label>
            <input type="number" class="quantity-input" value="1" min="1" style="display: none;">
        `;
        itemsList.appendChild(itemDiv);

        const checkbox = itemDiv.querySelector('input[type="checkbox"]');
        const quantityInput = itemDiv.querySelector('.quantity-input');

        checkbox.addEventListener('change', function() {
            quantityInput.style.display = this.checked ? 'inline-block' : 'none';
            updateSelectedItems();
        });

        quantityInput.addEventListener('input', updateSelectedItems);
    });
}

// Initialize dues when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    initializeItemsList();
    initializeData();
    
    // Add tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});

// Handle item selection and quantity changes
itemsList.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
        const quantityInput = e.target.parentElement.querySelector('.quantity-input');
        quantityInput.disabled = !e.target.checked;
        updateSelectedItems();
    } else if (e.target.type === 'number') {
        updateSelectedItems();
    }
});

// Update selected items and total
function updateSelectedItems() {
    const selected = [];
    let total = 0;

    itemsList.querySelectorAll('.item-checkbox').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            const quantity = parseInt(item.querySelector('.quantity-input').value);
            const price = parseInt(checkbox.dataset.price);
            const itemTotal = quantity * price;
            
            selected.push({
                name: checkbox.nextElementSibling.textContent.split(' - ')[0],
                quantity,
                price,
                total: itemTotal
            });
            
            total += itemTotal;
        }
    });

    displaySelectedItems(selected);
    totalAmount.textContent = total;
}

// Display selected items in the preview
function displaySelectedItems(items) {
    selectedItems.innerHTML = items.map(item => `
        <div class="selected-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>₹${item.total}</span>
        </div>
    `).join('');
}

// Generate and display invoice
generateInvoiceBtn.addEventListener('click', () => {
    try {
        const items = [];
        let total = 0;

        // Check if any items are selected
        const selectedCheckboxes = itemsList.querySelectorAll('input[type="checkbox"]:checked');
        if (selectedCheckboxes.length === 0) {
            alert('Please select at least one item to generate an invoice.');
            return;
        }

        itemsList.querySelectorAll('.item-checkbox').forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                const quantityInput = item.querySelector('.quantity-input');
                const quantity = parseInt(quantityInput.value) || 0;
                
                if (quantity <= 0) {
                    throw new Error(`Please enter a valid quantity for ${checkbox.dataset.name}`);
                }

                const price = parseInt(checkbox.dataset.price);
                const itemTotal = quantity * price;
                
                items.push({
                    name: checkbox.dataset.name,
                    quantity,
                    price,
                    total: itemTotal
                });
                
                total += itemTotal;
            }
        });

        const invoiceHTML = `
            <div class="invoice-content" style="padding: 15px; max-width: 100%; margin: 0 auto; font-size: 14px;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="./logo.png.png" alt="Galli Galli Dokand Logo" style="max-width: 80px; height: auto; margin-bottom: 8px;">
                    <h3 style="color: #333; margin-bottom: 8px; font-size: 18px;">Galli Galli Dokand</h3>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; flex-wrap: wrap; gap: 8px;">
                    <p style="margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
                    <p style="margin: 0;">Time: ${new Date().toLocaleTimeString()}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
                <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; min-width: 300px;">
                        <thead>
                            <tr>
                                <th style="text-align: left; padding: 8px; background-color: #f0f0f0; border: 1px solid #ddd; font-size: 14px;">Item</th>
                                <th style="text-align: center; padding: 8px; background-color: #f0f0f0; border: 1px solid #ddd; font-size: 14px;">Qty</th>
                                <th style="text-align: center; padding: 8px; background-color: #f0f0f0; border: 1px solid #ddd; font-size: 14px;">Price</th>
                                <th style="text-align: right; padding: 8px; background-color: #f0f0f0; border: 1px solid #ddd; font-size: 14px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td style="text-align: left; padding: 8px; border: 1px solid #ddd; font-size: 14px;">${item.name}</td>
                                    <td style="text-align: center; padding: 8px; border: 1px solid #ddd; font-size: 14px;">${item.quantity}</td>
                                    <td style="text-align: center; padding: 8px; border: 1px solid #ddd; font-size: 14px;">₹${item.price}</td>
                                    <td style="text-align: right; padding: 8px; border: 1px solid #ddd; font-size: 14px;">₹${item.total}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 8px; border: 1px solid #ddd; font-weight: bold; font-size: 14px;">Total:</td>
                                <td style="text-align: right; padding: 8px; border: 1px solid #ddd; font-weight: bold; font-size: 14px;">₹${total}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
                <div style="text-align: center; margin-top: 20px;">
                    <p style="font-size: 14px;">Thank you for your business!</p>
                    <div style="margin-top: 15px;">
                        <button id="upi-payment-btn" class="upi-btn" onclick="initiateUPIPayment(${total})">Pay with UPI</button>
                    </div>
                </div>
            </div>
        `;

        invoiceDetails.innerHTML = invoiceHTML;
        modal.style.display = 'block';
    } catch (error) {
        alert(error.message || 'An error occurred while generating the invoice.');
    }
});

// Modal close functionality
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Print invoice functionality
printInvoiceBtn.addEventListener('click', () => {
    const printWindow = window.open('', '_blank');
    const modalContent = modal.querySelector('.modal-content');
    const invoiceContent = modalContent.querySelector('.invoice-content').cloneNode(true);
    
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>Invoice - Galli Galli Dokand</title>
            <style>
                @page {
                    size: A4;
                    margin: 1cm;
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    font-size: 14px;
                }
                @media screen {
                    body {
                        padding: 15px;
                    }
                    .invoice-content {
                        max-width: 100%;
                        margin: 0 auto;
                    }
                }
                @media screen and (min-width: 768px) {
                    body {
                        padding: 30px;
                        font-size: 16px;
                    }
                    .invoice-content {
                        max-width: 800px;
                    }
                }
                @media print {
                    body {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    .invoice-content {
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            ${invoiceContent.outerHTML}
            <script>
                window.onload = () => {
                    window.print();
                    setTimeout(() => window.close(), 500);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
});

// Delete customer function
function deleteCustomer(customerName) {
    if (confirm(`Are you sure you want to delete ${customerName} and all their dues?`)) {
        dues = dues.filter(due => due.customerName !== customerName);
        try {
            localStorage.setItem('dues', JSON.stringify(dues));
            console.log('Deleted customer:', customerName);
            updateCustomerSummary();
            renderCustomerList();
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Error deleting customer. Please try again.');
        }
    }
}

function addNewCustomer(customerName, dueAmount) {
    // Create new due entry
    const newDue = {
        customerName: customerName,
        date: new Date().toISOString().split('T')[0],
        items: [{
            name: 'Initial Due',
            quantity: 1,
            price: dueAmount,
            total: dueAmount
        }]
    };
    
    // Add to dues array
    dues.push(newDue);
    
    // Save to localStorage
    try {
        localStorage.setItem('dues', JSON.stringify(dues));
        console.log('Added new customer:', newDue);
        
        // Update UI
        updateCustomerSummary();
        renderCustomerList();
        return true;
    } catch (error) {
        console.error('Error saving customer:', error);
        alert('Error saving customer. Please try again.');
        return false;
    }
}

// Function to print customer dues
function printCustomerDues(customerName, groupedTransactions) {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate the print content
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dues Report - ${customerName}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                .header { margin-bottom: 20px; }
                .date-group { margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f8f8f8; }
                .total { font-weight: bold; margin-top: 20px; }
                @media print {
                    body { padding: 0; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Dues Report</h1>
                <p><strong>Customer Name:</strong> ${customerName}</p>
                <p><strong>Total Due Amount:</strong> ₹${customers[customerName].totalDue.toFixed(2)}</p>
                <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
            </div>
            ${Object.entries(groupedTransactions).map(([date, transactions]) => `
                <div class="date-group">
                    <h3>${formatDate(date)}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map(t => t.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>₹${item.price.toFixed(2)}</td>
                                    <td>₹${(item.quantity * item.price).toFixed(2)}</td>
                                </tr>
                            `).join('')).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}
            <button onclick="window.print()" style="padding: 10px 20px; margin-top: 20px;">Print</button>
        </body>
        </html>
    `;
    
    // Write the content to the new window and trigger print
    printWindow.document.write(printContent);
    printWindow.document.close();
}

// Initialize dues when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    initializeItemsList();
}); 

// Audio Player functionality
const bgMusic = document.getElementById('bgMusic');
const playPauseBtn = document.getElementById('playPauseBtn');
const nextBtn = document.getElementById('nextBtn');

// List of music files
const musicFiles = ['d.mp3'];
let currentTrackIndex = 0;
let isPlaying = false;

// Function to attempt playing music
function tryPlayMusic() {
    if (!bgMusic) {
        console.error('Audio element not found!');
        return;
    }

    // Check if the audio file is actually loaded
    if (bgMusic.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        console.error('Audio file not found or cannot be loaded!');
        return;
    }

    bgMusic.muted = false;
    bgMusic.volume = 1;

    // Load the audio file if not loaded
    if (bgMusic.readyState === 0) {
        bgMusic.load();
    }

    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                isPlaying = true;
                updatePlayPauseButton();
            })
            .catch(error => {
                console.error('Playback failed:', error);
                isPlaying = false;
                updatePlayPauseButton();
            });
    }
}

// Function to pause music
function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    isPlaying = false;
    updatePlayPauseButton();
}

// Function to update play/pause button text
function updatePlayPauseButton() {
    if (!playPauseBtn) return;
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
}

// Play/Pause button functionality
playPauseBtn.addEventListener('click', () => {
    if (!bgMusic) return;
    
    if (isPlaying) {
        pauseMusic();
    } else {
        tryPlayMusic();
    }
});

// Next button functionality
nextBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    bgMusic.src = musicFiles[currentTrackIndex];
    if (isPlaying) {
        tryPlayMusic();
    }
});

// Update play/pause button text based on audio state
bgMusic.addEventListener('play', () => {
    isPlaying = true;
    updatePlayPauseButton();
});

bgMusic.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseButton();
});

bgMusic.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayPauseButton();
});

// Try to play music on various events
document.addEventListener('DOMContentLoaded', () => {
    updatePlayPauseButton();
});

// Add error handling for audio loading
bgMusic.addEventListener('error', (e) => {
    console.error('Audio loading error:', e.target.error);
    isPlaying = false;
    updatePlayPauseButton();
});

// Add UPI payment function
function initiateUPIPayment(amount) {
    // Replace 'your-upi-id' with your actual UPI ID
    const upiId = '9864728992@okbizaxis';
    const merchantName = 'Galli Galli Dokand';
    const transactionNote = 'Payment for purchase';
    
    // Create UPI URL
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&tr=${Date.now()}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // Open UPI payment
    window.location.href = upiUrl;
}
