// Firebase configuration
const firebaseConfig = {
    // Your Firebase configuration here
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements
const loginForm = document.getElementById('login-form');
const addMemberForm = document.getElementById('add-member-form');
const createBillForm = document.getElementById('create-bill-form');
const membersList = document.getElementById('members-list');
const billsList = document.getElementById('bills-list');

// Login functionality
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Logged in:', userCredential.user);
            document.getElementById('login').classList.add('hidden');
            document.getElementById('members').classList.remove('hidden');
            document.getElementById('bills').classList.remove('hidden');
            loadMembers();
            loadBills();
        })
        .catch((error) => {
            console.error('Login error:', error);
            alert('Login failed. Please check your credentials.');
        });
});

// Add member functionality
addMemberForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('member-name').value;
    const email = document.getElementById('member-email').value;

    db.collection('members').add({
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('Member added');
        addMemberForm.reset();
        loadMembers();
    })
    .catch((error) => {
        console.error('Error adding member:', error);
    });
});

// Load members
function loadMembers() {
    db.collection('members').orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
            membersList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const member = doc.data();
                const memberElement = document.createElement('div');
                memberElement.innerHTML = `
                    <p><strong>${member.name}</strong> - ${member.email}</p>
                    <button onclick="deleteMember('${doc.id}')">Delete</button>
                `;
                membersList.appendChild(memberElement);
            });
        })
        .catch((error) => {
            console.error('Error loading members:', error);
        });
}

// Delete member
function deleteMember(id) {
    db.collection('members').doc(id).delete()
        .then(() => {
            console.log('Member deleted');
            loadMembers();
        })
        .catch((error) => {
            console.error('Error deleting member:', error);
        });
}

// Create bill functionality
createBillForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const memberId = document.getElementById('member-select').value;
    const amount = document.getElementById('bill-amount').value;

    db.collection('bills').add({
        memberId: memberId,
        amount: parseFloat(amount),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('Bill created');
        createBillForm.reset();
        loadBills();
    })
    .catch((error) => {
        console.error('Error creating bill:', error);
    });
});

// Load bills
function loadBills() {
    db.collection('bills').orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
            billsList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const bill = doc.data();
                const billElement = document.createElement('div');
                billElement.innerHTML = `
                    <p><strong>Member ID:</strong> ${bill.memberId}</p>
                    <p><strong>Amount:</strong> $${bill.amount}</p>
                    <p><strong>Date:</strong> ${bill.createdAt.toDate().toLocaleString()}</p>
                `;
                billsList.appendChild(billElement);
            });
        })
        .catch((error) => {
            console.error('Error loading bills:', error);
        });
}

// Initialize the app
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('members').classList.remove('hidden');
        document.getElementById('bills').classList.remove('hidden');
        loadMembers();
        loadBills();
    } else {
        document.getElementById('login').classList.remove('hidden');
        document.getElementById('members').classList.add('hidden');
        document.getElementById('bills').classList.add('hidden');
    }
});