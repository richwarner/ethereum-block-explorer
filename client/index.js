import axios from 'axios';
require('dotenv').config('../.env');
const ethers = require('ethers');

const port = process.env.SERVER_PORT;
const server ="http://localhost:" + port;

const blocks = [];
const monitoring = [];

updateLatestBlock(); 

// Check a new block to see if it contains any addresses being monitored
function monitorCheck(block) {
    const alerts = [];
    for(const address of monitoring) {
        matchingTx = block.transactions.filter((element) => {if(element.to === address) return element;});
        for(const tx of matchingTx) {
            tx.timestamp = block.timestamp; // Grab the timestamp from the block object
            alerts.push(tx);
        }
    }
    // Perform alerts
    for(const alert of alerts) {
        const address = alert.to;
        const valueEther = ethers.utils.formatUnits(alert.value.hex, "ether");
        const cardContainer = document.querySelector("#card-container-monitor");
        const blockDate = new Date(alert.timestamp * 1000).toLocaleString('en-US', { timeZone: 'UTC' });
        
        // Add alert card to UI
        const newCard = document.createElement("div");
        newCard.classList = "card mb-3 animate__animated animate__pulse";
        // newCard.style = "width: 32rem;";
        newCard.innerHTML = `
        <div class="card-header lead text-truncate">
        ${address}
        </div>    
        <ul class="list-group list-group-flush">
            <li class="list-group-item">
                <table class="table table-borderless table-sm mb-0">
                    <tr><td>Ether</td><td>${ethers.utils.commify(valueEther)}</td></tr>
                </table>
            </li>
        </ul>
        <div class="card-footer small">
        ${blockDate}
        </div>`;
        cardContainer.prepend(newCard);

        // Pop notification
        const alertContainer = document.querySelector("#alert-container");
        const alertWrapper = document.createElement("div");
        alertWrapper.innerHTML = `        
        <div id="alert-${alert.hash}" class="toast" role="alert">
            <div class="toast-header text-truncate">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-alarm me-2" viewBox="0 0 16 16">
                    <path d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5z"/>
                    <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3zm1.038 3.018a6.093 6.093 0 0 1 .924 0 6 6 0 1 1-.924 0zM0 3.5c0 .753.333 1.429.86 1.887A8.035 8.035 0 0 1 4.387 1.86 2.5 2.5 0 0 0 0 3.5zM13.5 1c-.753 0-1.429.333-1.887.86a8.035 8.035 0 0 1 3.527 3.527A2.5 2.5 0 0 0 13.5 1z"/>
                </svg>
                <strong class="me-auto me-2">Block Monitor</strong>
                <small class="text-truncate ms-2">${address}</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                A monitored address just received <strong>${ethers.utils.commify(valueEther)} ether</strong>.
            </div>
        </div>
        `;
        alertContainer.appendChild(alertWrapper);
        const alertBox = new bootstrap.Toast(document.querySelector(`#alert-${alert.hash}`));
        alertBox.show();
    }
}

// Check for new blocks and if there are any, 
// add them to the UI and check them agains the monitoring list
async function updateLatestBlock() {
    // Fetch latest block
    let response = null;
    try {
        response = await axios.get(`${server}/block/latest`);        
        console.log(response);
    } 
    catch  {}  
        
    // Update UI
    if(response) {
        const blockNumber = response.data.number;
        const isNewBlock = blocks.filter((element) => {return element.number === blockNumber}).length === 0;
        if(isNewBlock) {
            const newBlock = response.data;
            blocks.push(newBlock);
            const cardContainer = document.querySelector("#block-container");
            const newCard = document.createElement("div");
            newCard.classList = "accordion mb-3 animate__animated animate__bounceInUp";
            // newCard.style = "width: 32rem;";
            newCard.innerHTML = `
            <div id="block-${blockNumber}" class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${blockNumber}-1">
                    <h4 class="text-truncate"><p class="mb-0">${ethers.utils.commify(blockNumber)}</p><p class="text-muted text-truncate mb-0" style="font-size:.9rem;">${newBlock.hash}</p></h4>
                </button>
                </h2>
                <div id="collapse-${blockNumber}-1" class="accordion-collapse collapse show" data-bs-parent="#block-${blockNumber}">
                    <div class="accordion-body">
                        <table class="table table-borderless table-sm mb-0">
                            <tr><td>Timestamp</td><td>${new Date(newBlock.timestamp * 1000).toLocaleString('en-US', { timeZone: 'UTC' })}</td></tr>
                            <tr><td>Nonce</td><td>${ethers.utils.commify(parseInt(newBlock.nonce, 16))}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${blockNumber}-2">
                    Gas (Difficulty: ${ethers.utils.commify(parseInt(newBlock._difficulty.hex, 16))})
                </button>
                </h2>
                <div id="collapse-${blockNumber}-2" class="accordion-collapse collapse" data-bs-parent="#block-${blockNumber}">
                    <div class="accordion-body">
                        <table class="table table-borderless table-sm mb-0">
                            <tr><td>Gas Limit</td><td>${ethers.utils.commify(parseInt(newBlock.gasLimit.hex, 16))}</td></tr>
                            <tr><td>Gas Used</td><td>${ethers.utils.commify(parseInt(newBlock.gasUsed.hex, 16))}</td></tr>
                        </table>                    
                    </div>
                </div>
            </div>
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${blockNumber}-3">
                    Transactions (${newBlock.transactions.length})
                </button>
                </h2>
                <div id="collapse-${blockNumber}-3" class="accordion-collapse collapse" data-bs-parent="#block-${blockNumber}">
                <div class="accordion-body">
                    <table id="tx-table-${blockNumber}" class="table table-borderless table-sm mb-0"></table>
                </div>
                </div>
            </div>`;

            const txTable = newCard.querySelector(`#tx-table-${blockNumber}`);  
            txTable.innerHTML = "<tr><th>To</th><th>Value (Ether)</th></tr>";
            for(const tx of newBlock.transactions){
                txTable.innerHTML += `<tr><td style="font-size:.8rem;">${tx.to}</td><td style="font-size:.8rem;">${ethers.utils.formatUnits(tx.value.hex, "ether")}</td></tr>`;
            }
            cardContainer. appendChild(newCard);

            // Check for any needed alerts
            monitorCheck(newBlock);
        } 
    }    

    // Poll again
    setTimeout(updateLatestBlock, 6000);
}

// Check balance handler
document.querySelector("#form-check-balance").addEventListener('submit', async (event) => {

    event.preventDefault();
    
    // Show loading spinner
    document.querySelector("#btn-check-balance").classList.add("d-none");
    document.querySelector("#btn-check-balance-loading").classList.remove("d-none");

    // Fetch balance
    const address = document.querySelector("#input-address-for-balance").value.trim();
    let response = null;
    try {
        response = await axios.get(`${server}/balance/${address}`);
        console.log(response);
    } 
    catch {} 
    
    // Update UI with balance
    if(response) {
        const balanceHex = response.data.balance.hex;
        const balanceEther = ethers.utils.formatUnits(balanceHex, "ether");
        const balanceWei = ethers.utils.formatUnits(balanceHex, "wei");        
        const cardContainer = document.querySelector("#card-container");
        const newCard = document.createElement("div");
        newCard.classList = "card mb-3 animate__animated animate__fadeInDown animate__faster";
        // newCard.style = "width: 32rem;";
        newCard.innerHTML = `
        <div class="card-header lead text-truncate">
        ${address}
        </div>    
        <ul class="list-group list-group-flush">
            <li class="list-group-item">
                <table class="table table-borderless table-sm mb-0">
                    <tr><td>Ether</td><td>${ethers.utils.commify(balanceEther)}</td></tr>
                    <tr><td>Wei</td><td>${ethers.utils.commify(balanceWei)}</td></tr>
                </table>
            </li>
        </ul>
        <div class="card-footer small">
        ${new Date().toLocaleString()}
        </div>`;
        cardContainer.prepend(newCard); 
    }

    // Remove loading spinner
    document.querySelector('#btn-check-balance').classList.remove('d-none');
    document.querySelector('#btn-check-balance-loading').classList.add('d-none');
 
});

// Monitoring handler
document.querySelector("#form-check-monitor").addEventListener('submit', async (event) => {

    event.preventDefault();     
    
    const address = document.querySelector("#input-address-for-monitor").value.trim();

    if(address.length) {
        // Add to monitoring
        monitoring.push(address);    
        // Update UI with monitoring
        const addressContainer = document.querySelector("#monitored-addresses-container");
        const item = document.createElement("li");
        item.classList = "list-group-item text-truncate";
        item.innerHTML = `<div class="spinner-border spinner-border-sm text-warning"></div>&nbsp;&nbsp;${address}`;
        addressContainer.appendChild(item); 
    }

    document.querySelector("#input-address-for-monitor").value = "";
});